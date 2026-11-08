---
title: 三种推理框架的适用边界
summary: 按显存、并发与部署形态划清 vLLM、llama.cpp、Ollama 的界线
order: 5
level: 入门
tags: [vLLM, llama.cpp, 本地推理]
updated: 2026-11-08
readingTime: 5
---

这三个框架经常被放在一张表里比参数，其实它们解决的问题不在一个层面上。vLLM 是给多并发吞吐设计的服务端引擎，llama.cpp 是给有限硬件榨出可用速度的推理库，Ollama 是在 llama.cpp 上包了一层模型管理和进程常驻。搞清楚这一层，选型就不用看跑分。

## 量化决定了能不能装下

一个 7B 模型，权重按 fp16 存是 14GB，加上 KV cache 和激活值，实际要 16GB 以上。同样的模型用 GGUF 的 Q4_K_M 量化，文件约 4.1GB，8GB 内存的机器就能跑。

| 形态 | 7B 权重占用 | 最低可用硬件 | 相对质量 |
| --- | --- | --- | --- |
| fp16 | 14GB | 24GB 显存 | 基准 |
| int8 / Q8_0 | 7–8GB | 12GB 显存 | 几乎无损 |
| Q5_K_M | 5.1GB | 10GB 显存 | 轻微下降 |
| Q4_K_M | 4.1GB | 8GB 显存 | 复杂推理开始出错 |
| Q3_K_M | 3.3GB | 6GB 显存 | 明显退化 |

量化只压权重，不压 KV cache，这是它最大的局限。

## KV cache 才是真正的瓶颈

选型第一步不是看框架文档，是算一个不等式。需要的内存约等于权重加 KV cache 加激活值余量：

```bash
python -c "print('weights GB:', 7*2, 7*0.5)"            # fp16 14.0 / Q4 3.5
python -c "print('kv GB:', 2*32*4096*8192*16*2/1e9)"    # 68.72
```

第二行算的是 32 层、隐藏维 4096、8k 上下文、并发 16、fp16 的 KV cache，68.7GB。它比权重大得多，这解释了一个常见误判：以为把权重压到 4GB 就能在 8GB 卡上开 32 并发，实际并发 2 就封顶。KV cache 随「序列长度 × 并发」线性增长，长上下文和高并发只能选一个。

降低它的手段有三个。GQA 让多数新模型天然省四分之三，因为 KV 头数从 32 降到 8。KV 量化把 fp16 转成 int8，再省一半，质量损失在长文任务上基本测不出来。前缀共享让系统提示词相同的请求共用一份 cache，vLLM 的 `--enable-prefix-caching` 属于这一类，llama.cpp 的 `--prompt-cache` 更接近把状态写盘，命中条件苛刻不少。

我自己的机器上跑 7B、8k 上下文、并发 4，实测 KV cache 占 17GB 左右，和公式对得上。估算偏大 5% 到 10% 是正常的，因为有 block 对齐造成的内部碎片。

## 并发模型决定了分水岭

vLLM 的核心是 PagedAttention 加 continuous batching。前者把 KV cache 切成固定大小的 block 分页管理，避免按最大长度预分配造成的碎片；后者让新请求在任意 step 插入正在跑的 batch，不用等整批结束。

结果是吞吐随并发上升得很快。单卡 A100 跑 7B，单请求可能只有 40 tok/s，但 32 并发时聚合吞吐能到 2000 tok/s 量级。代价是单请求延迟不一定更低，排队时间会上升。

llama.cpp 的 batch 是静态的，一次喂固定数量的序列，新请求要等这一轮结束。它在单用户场景下的解码速度很扎实，因为针对 CPU 的 SIMD 和 Metal、CUDA 后端都做了大量手工优化，M 系列芯片上跑 Q4 的 7B 能到 30 tok/s 以上。但并发一上来，吞吐曲线几乎是平的。

这条分界线大约是 8 到 10 个并发。低于这个数，llama.cpp 的启动开销和内存占用都更友好；高于这个数，vLLM 的单位成本会低一个数量级。

Ollama 默认 `OLLAMA_NUM_PARALLEL=1`，也就是串行处理。它的价值在于模型拉取、常驻内存、API 兼容这三件事做到了开箱可用，适合本地开发调试和单机桌面应用。把它放到公网做服务，队列会立刻堆起来。

## 三条命令的实际形态

三种形态各跑一次，参数差异一目了然。

```bash
vllm serve Qwen/Qwen2.5-7B-Instruct \
  --gpu-memory-utilization 0.88 \
  --max-model-len 16384 \
  --max-num-seqs 64 \
  --enable-prefix-caching \
  --port 8000

llama-server -m ./qwen2.5-7b-instruct-q4_k_m.gguf \
  -c 8192 -ngl 99 --threads 8 --port 8080

ollama run qwen2.5:7b-instruct-q4_K_M
```

`-ngl 99` 表示把所有层都放 GPU，显存放不下时会自动回落到部分卸载，但速度会掉一个量级。`--max-num-seqs` 是并发上限，设成 64 意味着最多 64 条序列同时在跑，超过就排队；这个值乘上平均输出长度，决定了 KV cache 的实际峰值。

`--gpu-memory-utilization 0.88` 是 vLLM 预分配显存的比例，剩下的留给 CUDA context 和别的进程。设到 0.95 以上，同机跑一个 embedding 模型就会 OOM；设到 0.7 以下，等于白买四分之一张卡。0.85 到 0.9 是稳态区间。

`--enable-prefix-caching` 对固定系统提示词的场景收益很大，同一段 2000 token 的前缀只算一次。llama.cpp 也有 `--prompt-cache`，但它是把整个 prompt 的状态存到磁盘，粒度粗，命中条件更苛刻。

## 我实际怎么选

本地开发跑通流程，用 Ollama。它的模型名带量化后缀，换版本不用管路径，`ollama ps` 还能看到哪个模型占了显存。

要交付一个离线桌面工具，用 llama.cpp 的库直接嵌进去。它的编译产物小，不依赖 Python，能打包进 Electron 或命令行工具。缺点是得自己管模型文件和上下文窗口。

要给团队提供一个内网接口，用 vLLM。它的 OpenAI 兼容层让现有 SDK 不用改，`--served-model-name` 可以把长模型名映射成短名。要注意它对不支持的参数是静默忽略而不是报错，客户端传了 `logit_bias` 之类不生效，调试时会以为模型不听话。

还有一个现实约束：vLLM 对模型架构的支持跟着上游走，新模型发布后要等它适配，急着用就得上主分支源码编译。llama.cpp 的 GGUF 转换脚本更新通常更快，因为社区会先做量化。这一点在选择模型版本时经常成为决定性因素。
