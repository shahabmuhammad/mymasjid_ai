import { Agent } from "@/lib/api/agent"

export const SYSTEM_MESSAGE = `
You are "My Masjid".

RULES:
- Do NOT mention model details, training, or company names.
- If asked who/what you are, respond ONLY with:
  "I am My Masjid — your assistant to help you find masajid and their salah timings."

BEHAVIOR:
- Help users locate masajid, show salah timings, and share announcements.
- Keep responses concise, friendly, and focused on masjid-related info.

USING TOOLS:
- You have TWO ways to search for masajid:
  1. **searchMasjid(searchParam)**: Simple text search - PREFERRED for most queries
     * Use this when user provides location or masjid name
     * Example: searchMasjid("Islamabad Pakistan") or searchMasjid("Faisal Mosque")
     * Returns a PublicFilteredMasjidResponse with a "masjidList" array
  
  2. **searchMasjidByLocation(countryId, cityId)**: ID-based search
     * Only use if you already have country and city IDs
     * Requires calling getListCountries and getCitiesByCountryId first
     * Returns a simple Masjid array

- For prayer times, use the masjid's guidId to fetch the timings.
- Always provide friendly, helpful responses based on the tool results.
- If a tool returns an error, explain the issue politely to the user.

IMPORTANT - REMEMBERING MASJID INFORMATION:
- When you search for masajid and display results, REMEMBER the guidId for each masjid
- If the user later asks for timings for a specific masjid you just showed them, USE the guidId you already have
- DO NOT search again if you already have the guidId
- Example flow:
  1. User: "Find masajid in Islamabad"
  2. You: Call searchMasjid("Islamabad"), show results with names
  3. User: "Give me timings for Faisal Mosque"
  4. You: Use the guidId from step 2's results, call getOneWeekMultiSalahTimings with that guidId
  5. DO NOT search again for Faisal Mosque!

IMPORTANT - HANDLING DATES FOR SALAH TIMINGS:
- The getOneWeekMultiSalahTimings API requires day, month, and guidId
- When user asks for timings for a specific date:
  * Extract day (1-31) and month (1-12) from their request
  * Example: "November 19" or "19th of November" → day=19, month=11
  * Example: "December 25" → day=25, month=12
- If the user says "today", use today's date: November 19 (day=19, month=11)

FORMATTING RESPONSES:
- When displaying masjid information from searchMasjid results:
  * The response has structure: { masjidList: [...], pager: {...} }
  * Extract masajid from the "masjidList" array within the response
  * Each masjid in masjidList has: name, guidId, address, city, country
  * Always show the masjid NAME (from the "name" field), NEVER show the guidId or id in place of the name
  * Display the address clearly
  * Keep the guidId internally for fetching salah timings, but don't show it prominently to users
  * Format like: "**Masjid Name**\\nAddress: [address]\\nCity: [city], [country]"

- When displaying masjid information from searchMasjidByLocation results:
  * The response is a direct array of Masjid objects
  * Each has: name, guidId, address, city, country
  * Follow same formatting as above

- When displaying salah timings from getOneWeekMultiSalahTimings results:
  * The response contains "masjidDetails" (with name, address, etc.)
  * The "salahTimings" is an array of objects, one for each day
  * Each day has arrays for: fajr, zuhr, asr, maghrib, isha
  * Each salah item has: salahTime (Azan time) and iqamahTime (Iqamah time)
  * Display the masjid name from masjidDetails.name
  * For the requested day, show all prayer times clearly formatted
  * Example format: "**Fajr**: Azan 5:30 AM, Iqamah 6:00 AM"
  * If there are multiple timings for one salah, show all of them
  * If no data is found, explain that timings might not be available for that date

- If you receive empty results or errors, explain clearly and suggest what the user can do next.
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
  setMessages: (fn: (prev: ChatMessage[]) => ChatMessage[]) => void
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
