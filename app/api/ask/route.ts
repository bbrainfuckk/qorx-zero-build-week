const MAX_QUESTION_CHARS = 2000;
const MAX_PROOF_CHARS = 1800;

function extractText(payload: Record<string, unknown>): string | null {
  if (typeof payload.output_text === "string") return payload.output_text;
  if (!Array.isArray(payload.output)) return null;
  for (const item of payload.output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (
        part &&
        typeof part === "object" &&
        typeof (part as { text?: unknown }).text === "string"
      ) {
        return (part as { text: string }).text;
      }
    }
  }
  return null;
}

export async function POST(request: Request) {
  let body: { question?: unknown; proofFrame?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  if (
    typeof body.question !== "string" ||
    body.question.length === 0 ||
    body.question.length > MAX_QUESTION_CHARS ||
    typeof body.proofFrame !== "string" ||
    body.proofFrame.length > MAX_PROOF_CHARS
  ) {
    return Response.json({ error: "invalid_input" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? "gpt-5.6-terra";
  if (!apiKey) {
    return Response.json(
      { error: "provider_not_configured", provider: "OpenAI" },
      { status: 503 },
    );
  }

  const instructions = [
    "Answer only from the Qorx Zero proof frame.",
    "If the proof frame does not support the answer, say what is missing.",
    "Never claim access to other local memories or files.",
    "Lead with the answer. Cite every supported claim with its source hash in square brackets.",
  ].join(" ");

  try {
    const input = [
      { role: "system", content: instructions },
      {
        role: "user",
        content: `PROOF FRAME\n${body.proofFrame || "(empty)"}\n\nQUESTION\n${body.question}`,
      },
    ];
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        store: false,
        reasoning: { effort: "low" },
        text: { verbosity: "low" },
        max_output_tokens: 500,
        input,
      }),
    });
    const payload = (await response.json()) as Record<string, unknown>;
    if (!response.ok) {
      return Response.json(
        { error: "provider_error", status: response.status },
        { status: 502 },
      );
    }
    const answer = extractText(payload);
    if (!answer) {
      return Response.json({ error: "empty_provider_response" }, { status: 502 });
    }
    return Response.json({ answer, provider: "OpenAI", model });
  } catch {
    return Response.json({ error: "provider_unreachable" }, { status: 502 });
  }
}
