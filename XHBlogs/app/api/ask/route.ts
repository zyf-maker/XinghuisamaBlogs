import { siteConfig } from "../../../siteConfig";
import { getIndexSize, retrieve } from "../../../lib/aiIndex";

export const runtime = "edge";

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  const apiKey =
    process.env.AI_API_KEY || process.env.OPENAI_API_KEY || process.env.OPENDESIGN_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "服务端未配置模型密钥。" }), {
      status: 503,
      headers: { "content-type": "application/json" },
    });
  }

  let payload: { message?: string; history?: ChatMessage[] };
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "请求体不是合法 JSON。" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const question = (payload.message || "").trim().slice(0, 800);
  if (!question) {
    return new Response(JSON.stringify({ error: "消息为空。" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const history = Array.isArray(payload.history)
    ? payload.history
        .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content.slice(0, 1200) }))
    : [];

  const hits = retrieve(question);
  const context = hits
    .map(
      (h, i) =>
        `[${i + 1}] 《${h.doc.title}》（${h.doc.categoryName}，/ai/${h.doc.key}）\n${h.doc.summary}\n${h.doc.body.slice(0, 1500)}`,
    )
    .join("\n\n---\n\n");

  const system =
    siteConfig.aiConfig.systemPrompt +
    "\n\n你可以使用下面的站内笔记作为依据。引用时必须写出篇目标题；笔记里没有的信息就说明没有，不要编。" +
    (context ? `\n\n<notes>\n${context}\n</notes>` : "\n\n（本次没有检索到相关笔记。）");

  const upstream = await fetch(`${siteConfig.aiConfig.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: siteConfig.aiConfig.modelId,
      messages: [{ role: "system", content: system }, ...history, { role: "user", content: question }],
      max_tokens: 520,
      temperature: siteConfig.aiConfig.temperature,
      stream: true,
    }),
    signal: AbortSignal.timeout(55000),
  }).catch(() => null);

  if (!upstream || !upstream.ok || !upstream.body) {
    const detail = upstream ? await upstream.text().catch(() => "") : "network error";
    return new Response(
      JSON.stringify({ error: "模型端点没有正常返回。", detail: detail.slice(0, 300) }),
      { status: 502, headers: { "content-type": "application/json" } },
    );
  }

  const sources = hits.map((h) => ({
    title: h.doc.title,
    key: h.doc.key,
    category: h.doc.category,
  }));

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const body = upstream.body;

  const stream = new ReadableStream({
    async start(controller) {
      // 第一帧先给检索结果，前端可以立刻渲染「参考了哪几篇」
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "sources", sources })}\n\n`));

      const reader = body.getReader();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (!data || data === "[DONE]") continue;

            try {
              const json = JSON.parse(data);
              const delta = json?.choices?.[0]?.delta?.content;
              if (typeof delta === "string" && delta) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: "delta", text: delta })}\n\n`),
                );
              }
            } catch {
              // 上游偶发不合法分片，跳过即可
            }
          }
        }
      } catch {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "error", message: "生成中断。" })}\n\n`),
        );
      }

      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    },
  });
}

export async function GET() {
  return new Response(
    JSON.stringify({ status: "ready", model: siteConfig.aiConfig.modelId, docs: getIndexSize() }),
    { headers: { "content-type": "application/json" } },
  );
}
