// app/api/chat/route.ts
// 站内 AI 助手：走 OpenAI 兼容协议，端点与模型都在 siteConfig.aiConfig 里配置
import { siteConfig } from "../../../siteConfig";

export const runtime = "edge";

type ChatBody = { message?: string; messages?: { role: string; content: string }[] };

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ChatBody;
    const { baseUrl, modelId, systemPrompt, maxOutputTokens, temperature } = siteConfig.aiConfig;

    // 密钥只从环境变量读，不写进仓库
    const apiKey = (
      process.env.AI_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.OPENDESIGN_API_KEY ||
      ""
    ).trim();

    if (!apiKey) {
      return Response.json(
        { error: "服务端未配置 AI_API_KEY" },
        { status: 503 },
      );
    }

    const history = Array.isArray(body.messages)
      ? body.messages
          .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
          .slice(-6)
          .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }))
      : [];

    const userMessage = (body.message || "").toString().trim().slice(0, 2000);
    if (!userMessage && history.length === 0) {
      return Response.json({ error: "消息为空" }, { status: 400 });
    }

    const messages = [
      { role: "system", content: systemPrompt },
      ...history,
      ...(userMessage ? [{ role: "user", content: userMessage }] : []),
    ];

    const upstream = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages,
        max_tokens: maxOutputTokens,
        temperature,
        stream: false,
      }),
      signal: AbortSignal.timeout(45000),
    });

    const data: any = await upstream.json().catch(() => null);

    if (!upstream.ok) {
      console.error("[api/chat] upstream error", upstream.status, JSON.stringify(data)?.slice(0, 500));
      return Response.json(
        {
          error: `模型服务返回 ${upstream.status}`,
          details: data?.error?.message || data?.message || "未知错误",
        },
        { status: 502 },
      );
    }

    const reply =
      data?.choices?.[0]?.message?.content?.toString().trim() ||
      data?.choices?.[0]?.text?.toString().trim() ||
      "没有拿到内容，稍后再试。";

    return Response.json({ reply, model: modelId });
  } catch (error: any) {
    console.error("[api/chat] failed", error?.message);
    return Response.json({ error: error?.message || "请求失败" }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ status: "ready", model: siteConfig.aiConfig.modelId });
}
