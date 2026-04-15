import { NextRequest, NextResponse } from "next/server";

type AssistantRecommendation = {
  type: "lms_lesson" | "ctf_challenge" | "workspace" | "general";
  id?: number;
  title: string;
  reason: string;
  href?: string;
};

type AssistantAction = {
  label: string;
  href: string;
};

type AssistantResponse = {
  answer: string;
  recommendations: AssistantRecommendation[];
  actions: AssistantAction[];
};

type AssistantContext = {
  route?: string;
  pageType?: string;
  workspace?: { running?: boolean };
  lmsStats?: { accuracy?: number };
  domSnapshot?: {
    title?: string;
    url?: string;
    headings?: string[];
    visibleText?: string;
    visibleActions?: string[];
  };
};

function sanitizeContext(context: unknown): AssistantContext {
  if (!context || typeof context !== "object") return {};
  const raw = context as Record<string, unknown>;
  return {
    route: typeof raw.route === "string" ? raw.route.slice(0, 120) : "",
    pageType: typeof raw.pageType === "string" ? raw.pageType.slice(0, 60) : "",
    workspace: typeof raw.workspace === "object" && raw.workspace ? (raw.workspace as { running?: boolean }) : {},
    lmsStats: typeof raw.lmsStats === "object" && raw.lmsStats ? (raw.lmsStats as { accuracy?: number }) : {},
    domSnapshot:
      typeof raw.domSnapshot === "object" && raw.domSnapshot
        ? {
            title:
              typeof (raw.domSnapshot as Record<string, unknown>).title === "string"
                ? (raw.domSnapshot as Record<string, unknown>).title?.toString().slice(0, 200)
                : "",
            url:
              typeof (raw.domSnapshot as Record<string, unknown>).url === "string"
                ? (raw.domSnapshot as Record<string, unknown>).url?.toString().slice(0, 300)
                : "",
            headings: Array.isArray((raw.domSnapshot as Record<string, unknown>).headings)
              ? ((raw.domSnapshot as Record<string, unknown>).headings as unknown[])
                  .map((item) => String(item))
                  .slice(0, 30)
              : [],
            visibleText:
              typeof (raw.domSnapshot as Record<string, unknown>).visibleText === "string"
                ? (raw.domSnapshot as Record<string, unknown>).visibleText?.toString().slice(0, 15000)
                : "",
            visibleActions: Array.isArray((raw.domSnapshot as Record<string, unknown>).visibleActions)
              ? ((raw.domSnapshot as Record<string, unknown>).visibleActions as unknown[])
                  .map((item) => String(item))
                  .slice(0, 60)
              : [],
          }
        : {},
  };
}

function fallbackResponse(): AssistantResponse {
  return {
    answer: "I can help with learning and challenge recommendations. Try asking: 'What should I do next in LMS?'",
    recommendations: [
      {
        type: "general",
        title: "Continue LMS learning",
        reason: "Progress in LMS improves fundamentals for CTF challenge solving.",
        href: "/lms/modules",
      },
    ],
    actions: [
      { label: "Open Learning Modules", href: "/lms/modules" },
      { label: "Open Challenges", href: "/challenges" },
    ],
  };
}

function buildHeuristicResponse(answer: string, context: AssistantContext): AssistantResponse {
  const pageType = context.pageType || "general";
  const recommendations: AssistantRecommendation[] = [];
  const actions: AssistantAction[] = [];

  if (pageType.startsWith("lms")) {
    recommendations.push({
      type: "lms_lesson",
      title: "Continue the LMS path",
      reason: "Focus on completing one full module before switching topics.",
      href: "/lms/modules",
    });
    actions.push({ label: "Open LMS Modules", href: "/lms/modules" });

    if ((context.lmsStats?.accuracy || 0) < 70) {
      recommendations.push({
        type: "general",
        title: "Review weaker topics",
        reason: "Your LMS accuracy suggests revisiting foundational lessons.",
        href: "/lms/progress",
      });
      actions.push({ label: "Open LMS Progress", href: "/lms/progress" });
    }
  } else if (pageType === "challenges") {
    recommendations.push({
      type: "ctf_challenge",
      title: "Pick one medium challenge",
      reason: "Steady progression gives better retention than random jumping.",
      href: "/challenges",
    });
    actions.push({ label: "Open Challenges", href: "/challenges" });
  } else if (pageType === "workspace") {
    recommendations.push({
      type: "workspace",
      title: context.workspace?.running ? "Use current workspace session" : "Start a workspace session",
      reason: "Hands-on practice in the workspace is ideal for implementation tasks.",
      href: "/workspace",
    });
    actions.push({ label: "Open Workspace", href: "/workspace" });
  } else {
    recommendations.push({
      type: "general",
      title: "Use profile-driven roadmap",
      reason: "Track gaps and pick next tasks from your profile dashboard.",
      href: "/profile",
    });
    actions.push({ label: "Open Profile", href: "/profile" });
    actions.push({ label: "Open LMS Modules", href: "/lms/modules" });
  }

  return {
    answer: answer || fallbackResponse().answer,
    recommendations: recommendations.slice(0, 5),
    actions: actions.slice(0, 4),
  };
}

export async function POST(req: NextRequest) {
  const openaiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  if (!openaiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured on the server." },
      { status: 500 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const context = sanitizeContext(body?.context);
  const shouldStream = body?.stream === true;

  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const systemPrompt = [
    "You are an in-app assistant for a CTF + LMS platform.",
    "Give concise, practical recommendations tailored to the current page and user progress.",
    "You receive a domSnapshot captured from the fully rendered page the user is viewing.",
    "Use domSnapshot.visibleText, domSnapshot.headings, and domSnapshot.visibleActions to answer what is on screen now.",
    "Do not invent private data not present in context.",
    "Prefer action-oriented steps and route-based suggestions.",
  ].join(" ");

  const userPrompt = JSON.stringify({
    userMessage: message.slice(0, 1000),
    context,
  });

  if (!shouldStream) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        messages: [
          { role: "system", content: `${systemPrompt} Return JSON only with keys: answer.` },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ error: "OpenAI request failed", details: text.slice(0, 500) }, { status: 502 });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    try {
      const parsed = JSON.parse(content) as { answer?: string };
      return NextResponse.json(buildHeuristicResponse(parsed.answer || "", context));
    } catch {
      return NextResponse.json(fallbackResponse());
    }
  }

  const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      stream: true,
      messages: [
        { role: "system", content: `${systemPrompt} Return plain text only.` },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!openaiResponse.ok || !openaiResponse.body) {
    const text = await openaiResponse.text().catch(() => "");
    return NextResponse.json(
      { error: "OpenAI stream request failed", details: text.slice(0, 500) },
      { status: 502 },
    );
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = openaiResponse.body.getReader();

  let answer = "";
  let buffer = "";

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.replace(/^data:\s*/, "");

            if (payload === "[DONE]") {
              const finalPayload = buildHeuristicResponse(answer.trim(), context);
              controller.enqueue(encoder.encode(`event: done\ndata: ${JSON.stringify(finalPayload)}\n\n`));
              controller.close();
              return;
            }

            try {
              const parsed = JSON.parse(payload);
              const delta = parsed?.choices?.[0]?.delta?.content;
              if (typeof delta === "string" && delta.length > 0) {
                answer += delta;
                controller.enqueue(encoder.encode(`event: answer\ndata: ${JSON.stringify({ chunk: delta })}\n\n`));
              }
            } catch {
              // Ignore malformed chunk and continue streaming.
            }
          }
        }

        const finalPayload = buildHeuristicResponse(answer.trim(), context);
        controller.enqueue(encoder.encode(`event: done\ndata: ${JSON.stringify(finalPayload)}\n\n`));
        controller.close();
      } catch (error) {
        const messageText = error instanceof Error ? error.message : "Streaming failed";
        controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: messageText })}\n\n`));
        controller.close();
      } finally {
        reader.releaseLock();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
