type ChatMessage = {
  role: "system" | "user";
  content: string;
};

export async function generateChatCompletion(
  messages: ChatMessage[],
  options?: { temperature?: number },
) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      temperature: options?.temperature ?? 0.6,
    }),
  });

  const result = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(result.error?.message ?? "OpenAI request failed.");
  }

  const content = result.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("OpenAI returned an empty response.");
  }

  return content;
}

const INQUIRY_SYSTEM_PROMPT = `You are an operations assistant for VELLUNE, a premium skincare brand admin team.
Write concise, actionable internal notes in Korean for the staff member handling a customer inquiry.
Include: recommended next steps, points to confirm with the customer, suggested status transition if relevant, and any follow-up timeline.
Use a practical checklist tone. Do not write a customer-facing reply.
Output plain text only, no markdown headings.`;

const BOARD_REPLY_SYSTEM_PROMPT = `You are the official VELLUNE customer support team writing a board reply.
Write a warm, professional, and friendly reply in Korean to the customer's post.
Be helpful and empathetic. Keep a premium brand tone — polite but not overly formal.
If information is missing, ask a gentle clarifying question rather than guessing.
Do not mention AI. Output only the reply text the admin can post as-is (admin may edit before posting).`;

export async function generateInquiryNotes(input: {
  id: string;
  date: string;
  type: string;
  company: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  notes: string;
}) {
  const userPrompt = [
    `문의 ID: ${input.id}`,
    `접수일: ${input.date}`,
    `유형: ${input.type}`,
    `회사: ${input.company || "-"}`,
    `이름: ${input.name}`,
    `이메일: ${input.email}`,
    `연락처: ${input.phone || "-"}`,
    `현재 상태: ${input.status}`,
    `기존 비고: ${input.notes || "(없음)"}`,
    "",
    "문의 내용:",
    input.message,
  ].join("\n");

  return generateChatCompletion(
    [
      { role: "system", content: INQUIRY_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    { temperature: 0.5 },
  );
}

export async function generateBoardReplyDraft(input: {
  title: string;
  content: string;
  authorEmail: string;
  createdAt: string;
  existingReplies: string[];
}) {
  const userPrompt = [
    `게시글 제목: ${input.title}`,
    `작성자: ${input.authorEmail}`,
    `작성일: ${input.createdAt}`,
    "",
    "게시글 내용:",
    input.content,
    "",
    input.existingReplies.length > 0
      ? `기존 관리자 답글:\n${input.existingReplies.join("\n---\n")}`
      : "기존 관리자 답글: 없음",
  ].join("\n");

  return generateChatCompletion(
    [
      { role: "system", content: BOARD_REPLY_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    { temperature: 0.7 },
  );
}
