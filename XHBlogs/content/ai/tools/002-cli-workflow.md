---
title: "CLI 与本地工作流：把重复操作脚本化"
summary: "把一次性的对话式调用改造成可版本控制、可重放、可并发的命令行脚本，覆盖参数收敛、缓存、批处理、断点续跑与常见踩坑。"
order: 2
level: "进阶"
tags: ["命令行", "自动化", "工作流"]
updated: "2026-11-05"
readingTime: 4
---

我在网页里调模型的时间越来越短，在终端里调它的时间越来越长。原因很朴素：网页里的对话不可复现，参数不在版本控制里，跑一百条要手工点一百次。而我的大部分 AI 需求其实是批量的、重复的、需要留痕的。这一篇讲我怎么把这类操作固化成脚本。

## 为什么值得搬到命令行

三个理由。第一是可重放：模型名、温度、提示词全在文件里，三个月后能原样再跑一次。第二是可组合：脚本能吃 `git diff` 的输出，能进 `pre-commit`，能接 `jq`。第三是可批量：并发、重试、断点续跑这些工程能力，网页永远不会给你。

代价是要自己处理密钥、超时、限流和输出格式。下面这些是我踩完之后留下来的最小结构。

## 从一次裸调用开始

不要一上来就写框架。先用 curl 跑通一次，确认鉴权和请求体没问题：

```bash
curl -s https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d @payload.json | jq -r '.choices[0].message.content'
```

关键在 `-d @payload.json`。把请求体放文件里，能彻底避开 shell 的引号问题——中文、换行、花括号在双引号里都会出事。我第一次写内联 JSON 时，被一个提示词里的反引号坑了半小时。

## 把参数收敛进一个脚本

裸 curl 用两次就不够了。我固定写一个只用标准库加 httpx 的小脚本，参数只有五个：

```python
#!/usr/bin/env python3
import argparse, hashlib, json, os
import httpx

def digest(payload):
    return hashlib.sha256(json.dumps(payload, sort_keys=True, ensure_ascii=False).encode()).hexdigest()[:16]

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", required=True)
    ap.add_argument("--prompt", required=True, help="prompt 文件路径")
    ap.add_argument("--temperature", type=float, default=0.0)
    ap.add_argument("--max-tokens", type=int, default=1024)
    ap.add_argument("--cache-dir", default=".llm-cache")
    a = ap.parse_args()

    body = {
        "model": a.model,
        "temperature": a.temperature,
        "max_tokens": a.max_tokens,
        "messages": [{"role": "user", "content": open(a.prompt, encoding="utf-8").read()}],
    }
    key = digest(body)
    cached = os.path.join(a.cache_dir, key + ".json")
    if os.path.exists(cached):
        print(open(cached, encoding="utf-8").read(), end="")
        return

    r = httpx.post("https://api.openai.com/v1/chat/completions",
                   headers={"Authorization": f"Bearer {os.environ['OPENAI_API_KEY']}"},
                   json=body, timeout=60.0)
    r.raise_for_status()
    text = r.json()["choices"][0]["message"]["content"]
    os.makedirs(a.cache_dir, exist_ok=True)
    open(cached, "w", encoding="utf-8").write(text)
    print(text, end="")
```

缓存键是「模型加完整请求体」的哈希，这意味着改一个字就重新请求，不改就命中。提示词调试期间这个机制能省掉大量重复调用，也让重跑变快。

## 批处理：并发要有上限

最朴素的批量做法是 `xargs -P`，够用且不写代码：

```bash
ls inputs/*.txt | xargs -P 4 -I{} sh -c \
  'python ask.py --model gpt-4o-mini --prompt {} > out/$(basename {} .txt).md'
```

但 `xargs` 不会退避重试，也不会区分错误类型。请求量上百条之后，我换成 asyncio 加信号量（semaphore）：

```python
import asyncio, random

sem = asyncio.Semaphore(8)

async def one(path):
    async with sem:
        for attempt in range(4):
            try:
                return await call(path)
            except RateLimitError:
                await asyncio.sleep(2 ** attempt + random.random())
        raise RuntimeError(path)
```

信号量控制的是在途请求数，不是速率。如果供应商按每分钟 token 计费限流，还需要一个令牌桶（token bucket），否则八个长请求同时发出去一样会 429。

| 方式 | 适合规模 | 缺点 |
|---|---|---|
| 串行 for 循环 | 十条以内 | 慢，但好调试 |
| `xargs -P` | 几十到几百条 | 无退避，错误处理粗糙 |
| asyncio 加信号量 | 上千条 | 要写代码，要处理取消 |

## 结果必须落成可重放的格式

我坚持用 JSONL，一行一条，字段固定下来：

```json
{"input_hash":"a1b2c3","model":"gpt-4o-mini","temperature":0,"output":"...","latency_ms":812,"in_tok":1520,"out_tok":88,"ts":"2026-11-04T21:03:11Z"}
```

好处是断点续跑非常容易：启动时先读已有文件，把 `input_hash` 收进集合，跳过的直接略过。上千条任务跑到一半断网，重跑只补没做过的。

这也是我判断一个 AI 脚本是否「工程化」的最低标准——它能不能在中途死掉之后继续，而不是从头再来一遍、再花一遍钱。

## 和 git、shell 结合的几个用法

代码评审是最顺手的一个：

```make
review:
	git diff --cached | python ask.py --model gpt-4o-mini --prompt prompts/review.md
```

`prompts/review.md` 里写清楚关注点：空指针、错误吞掉、并发共享状态、缺测试。它不能替代人看 diff，但能在提交前抓到明显问题，成本几分钱。

另一个用法是把提示词回归测试挂进 `pre-commit`：固定十条输入，跑一遍，比对输出和快照的相似度。改了系统提示就自动提醒。注意这一步要快，超过五秒的钩子一定会被同事关掉。

## 提示词当成代码来管

我把每个提示词写成 `.md` 文件，头部用极简的注释记元信息：版本、适用模型、上次验证日期。正文里用占位符区分变量，脚本负责替换：

```bash
python ask.py --model gpt-4o-mini --prompt prompts/review.md \
  --var diff="$(git diff --cached)"
```

变量替换我坚持用一次性的字符串替换，不用模板引擎。`str.format` 遇到代码里的花括号就会炸，而代码评审的输入里全是花括号。换成 `string.Template` 的 `$var` 语法更安全，代码里的 `$` 又相对少见。

提示词进 git 之后有个直接收益：可以对着历史版本做二分。某天发现输出质量下降，先看提示词文件有没有被改过，再看模型有没有换版本，两个变量一次就能排除一个。

## 让输出可机读，而不是可读

脚本的输出会被下游消费，所以我在提示词里直接约束格式，而不是在代码里用正则去抠。要求模型只输出 JSON，字段名写死在提示词里，然后加一道校验：

```python
import json
try:
    data = json.loads(text)
    assert set(data) == {"risk", "lines", "suggestion"}
except (json.JSONDecodeError, AssertionError):
    raise SystemExit(f"bad output from model: {text[:200]}")
```

校验失败就让整个任务失败，不要试图修补。我试过用正则从半截 JSON 里救数据，结果是错误数据静默流进了下游，比直接报错难查得多。

## 成本要有可见的账

脚本每次调用都把 token 数和估算费用写进 JSONL，跑完汇总一行：

```bash
jq -s 'map(.cost) | add' out/run.jsonl
```

这个数字最大的作用是让人对「随手跑一遍」有感觉。批量一千条、每条输入两千 token，一次全量重跑可能就是几美元。有了这个数，改提示词之前我才会先在小样本上试。

## 踩过的坑

密钥不要写进脚本。用环境变量或 `.env`，并且确认 `.gitignore` 里有它——我见过有人把 key 提上公开仓库，十分钟后收到账单。

超时要显式设置，而且重试要分类。429 和 5xx 值得退避重试，400 和 401 重试一万次也没用，只会浪费配额。我第一版脚本无脑重试所有异常，结果一个错误的模型名跑了四遍。

标准输出只放结果，日志走 stderr。否则管道下游拿到的是日志和答案混在一起的东西，`jq` 直接报错。

大文件要分块，而且块之间要有重叠。切在句子中间，模型会凭空补全半句话，这类错误很难在结果里发现。

## 我的做法

一个 `tools/llm/` 目录放四样东西：单次调用的脚本、批量脚本、`prompts/` 里的模板文件、以及缓存目录。提示词是文件而不是字符串，这样每次调整都会出现在 diff 里，能回滚，也能被评审。

不追框架。LangChain 之类的编排层在我这种「调一次、存一次」的场景里是负担，一个两百行的脚本更可控。等真的需要多步状态机了再换。
