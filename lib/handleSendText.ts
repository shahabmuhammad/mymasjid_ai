import { Agent } from "@/lib/api/agent"

export const SYSTEM_MESSAGE = `
You are \"My Masjid\".

RULES:
- Do NOT mention model details, training, or company names.
- If asked who/what you are, respond ONLY with:
  \"I am My Masjid — your assistant to help you find masajid and their salah timings.\"

BEHAVIOR:
- Help users locate masajid, show salah timings, and share announcements.
- Keep responses concise, friendly, and focused on masjid-related info.
`;

export interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
  timestamp?: Date
  type?: string
}


export async function handleSendText({
  textInput,
  messages,
  setMessages,
  setTextInput,
}: {
  textInput: string
  messages: ChatMessage[]
  setMessages: (fn: (prev: ChatMessage[]) => ChatMessage[] ) => void
  setTextInput: (val: string) => void
}) {
  if (!textInput.trim()) return;

  const messageToSend = textInput;
  setTextInput("");

  // Add user message to chat
  setMessages((prev) => [
    ...prev,
    { role: "user", content: messageToSend },
    { role: "assistant", content: "ThinkingMsg" }
  ]);

  // Accumulate last 4 messages + current user message (total 5)
  let contextMessages: ChatMessage[] = [];
  // Always start with system message
  contextMessages = [
    { role: "system", content: SYSTEM_MESSAGE },
    ...messages,
    { role: "user", content: messageToSend }
  ];
  // Only keep the last 5 user/assistant messages, but always include system message
  const filtered = contextMessages.filter(msg => msg.role !== "system");
  const lastFive = filtered.slice(-5);
  contextMessages = [
    { role: "system", content: SYSTEM_MESSAGE },
    ...lastFive
  ];

  // Format context for prompt
  const prompt = contextMessages
    .map((msg) => {
      if (msg.role === "system") return `System: ${msg.content}`;
      return `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`;
    })
    .join("\n");

  // Call Agent and replace 'Thinking ...' with response
  try {
    const aiResponse = await Agent(prompt);
    let content = "";
    // Gemini response extraction
    if (
      aiResponse &&
      aiResponse.candidates &&
      Array.isArray(aiResponse.candidates) &&
      aiResponse.candidates[0]?.content?.parts &&
      Array.isArray(aiResponse.candidates[0].content.parts) &&
      aiResponse.candidates[0].content.parts[0]?.text
    ) {
      content = aiResponse.candidates[0].content.parts[0].text;
    } else if (typeof aiResponse === "string") {
      content = aiResponse;
    } else {
      content = JSON.stringify(aiResponse);
    }
    setMessages((prev) => {
      // Replace the last assistant message if it's 'ThinkingMsg'
      const lastIdx = prev.length - 1;
      if (lastIdx >= 0 && prev[lastIdx].role === "assistant" && prev[lastIdx].content === "ThinkingMsg") {
        return [
          ...prev.slice(0, lastIdx),
          { role: "assistant", content }
        ];
      }
      return [...prev, { role: "assistant", content }];
    });
  } catch (error) {
    setMessages((prev) => {
      const lastIdx = prev.length - 1;
      if (lastIdx >= 0 && prev[lastIdx].role === "assistant" && prev[lastIdx].content === "ThinkingMsg") {
        return [
          ...prev.slice(0, lastIdx),
          { role: "assistant", content: "Error: Could not get response from AI." }
        ];
      }
      return [...prev, { role: "assistant", content: "Error: Could not get response from AI." }];
    });
    console.error("Agent error:", error);
  }
}
