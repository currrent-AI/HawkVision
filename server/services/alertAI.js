const GROQ_API_URL =
  "https://api.groq.com/openai/v1/chat/completions";

const GROQ_MODEL = "openai/gpt-oss-20b";

const EMERGENCY_SYSTEM_PROMPT = `
You are HawkVision Emergency AI, a disaster-response assistant for floods, earthquakes, fires, storms, landslides, evacuation, shelters, and rescue.

Give concise, safety-first guidance in the user's language.

For immediate danger:
- Lead with the safest immediate action.
- Tell the user to use HawkVision SOS or contact local emergency services.
- Do not tell the user to enter a dangerous area.
- Do not provide instructions that could put the user at greater risk.

Never invent:
- shelters
- locations
- rescue availability
- emergency contacts
- road conditions
- water levels
- weather conditions
- live disaster conditions

Do not provide phone numbers or country-specific emergency contact numbers.

Ask for the user's location when location-specific information is needed.

Do not provide dangerous instructions, medical diagnoses, or advice to enter a hazard zone.

Reply in plain text only.
Do not use markdown.
Do not use headings.
Do not use tables.
Keep the response under 100 words.
`;

/**
 * Generic Groq completion helper
 */
const requestGroqCompletion = async ({
  messages,
  temperature,
  maxCompletionTokens,
  responseFormat,
  reasoningEffort,
}) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing");
  }

  const body = {
    model: GROQ_MODEL,
    messages,
    temperature,
    max_completion_tokens: maxCompletionTokens,
  };

  // GPT-OSS supports reasoning effort.
  // We only use it when explicitly requested so that
  // existing alert generation behavior remains unchanged.
  if (reasoningEffort) {
    body.reasoning_effort = reasoningEffort;
  }

  if (responseFormat) {
    body.response_format = responseFormat;
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Groq API error (${response.status}): ${errorText}`
    );
  }

  const data = await response.json();

  const choice = data.choices?.[0];
  const content = choice?.message?.content;

  if (!content || !content.trim()) {
    console.error("Groq returned no visible content:", {
      finish_reason: choice?.finish_reason,
      message: choice?.message,
      usage: data.usage,
    });

    throw new Error("Groq returned an empty response");
  }

  return content;
};

/**
 * Convert frontend conversation history
 * into Groq-compatible messages.
 */
const buildConversationMessages = (conversation, message) => {
  if (!Array.isArray(conversation)) {
    return [];
  }

  const history = conversation
    .filter(
      (entry) =>
        entry &&
        typeof entry === "object"
    )
    .map((entry) => {
      const content =
        typeof entry.content === "string"
          ? entry.content
          : entry.text;

      if (
        typeof content !== "string" ||
        !content.trim()
      ) {
        return null;
      }

      const role =
        entry.role === "user" ||
        entry.type === "user"
          ? "user"
          : entry.role === "assistant" ||
              entry.type === "bot"
            ? "assistant"
            : null;

      if (!role) {
        return null;
      }

      return {
        role,
        content: content
          .trim()
          .slice(0, 1000),
      };
    })
    .filter(Boolean)
    .slice(-10);

  // Avoid sending the current user message twice.
  if (
    history.at(-1)?.role === "user" &&
    history.at(-1).content === message
  ) {
    history.pop();
  }

  return history;
};

/**
 * Generate Emergency Chatbot response
 */
const generateEmergencyChatReply = async (
  message,
  conversation
) => {
  const content = await requestGroqCompletion({
    messages: [
      {
        role: "system",
        content: EMERGENCY_SYSTEM_PROMPT,
      },

      ...buildConversationMessages(
        conversation,
        message
      ),

      {
        role: "user",
        content: message,
      },
    ],

    temperature: 0.2,

    // Increased from 400 to 800 so GPT-OSS
    // has enough completion budget.
    maxCompletionTokens: 800,

    // Important for GPT-OSS-20B emergency chat.
    // Low reasoning reduces the chance that the
    // reasoning consumes the whole completion budget.
    reasoningEffort: "low",
  });

  return content
    .trim()
    .replace(
      /^```(?:text|markdown)?\s*/i,
      ""
    )
    .replace(
      /\s*```$/i,
      ""
    )
    .trim();
};

/**
 * Analyze disaster alert with AI
 */
const analyzeAlertWithAI = async (
  eventData
) => {
  const prompt = `
HawkVision AI disaster alert system.

Analyze this event:

${JSON.stringify(eventData)}

Return ONLY one JSON object using exactly these fields:

{
  "type": "Flood Warning",
  "title": "short title",
  "description": "short emergency description",
  "severity": "HIGH",
  "riskScore": 0.57,
  "confidence": 0.90
}

Rules:
- type must be:
  Flood Warning,
  Flood,
  Earthquake,
  Landslide,
  Fire,
  Storm,
  SOS Emergency,
  Victim Detected,
  System Alert

- severity must be:
  LOW,
  MEDIUM,
  HIGH,
  CRITICAL

- riskScore must be between 0 and 1.
- confidence must be between 0 and 1.
- Return JSON only.
- No markdown.
`;

  const content = await requestGroqCompletion({
    messages: [
      {
        role: "system",
        content:
          "Return only valid JSON for a disaster alert.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],

    temperature: 0.1,

    maxCompletionTokens: 800,

    responseFormat: {
      type: "json_object",
    },
  });

  console.log(
    "🤖 Groq alert response:",
    content
  );

  let cleanedContent = content
    .trim()
    .replace(
      /^```json\s*/i,
      ""
    )
    .replace(
      /^```\s*/i,
      ""
    )
    .replace(
      /\s*```$/i,
      ""
    )
    .trim();

  let result;

  try {
    result = JSON.parse(cleanedContent);
  } catch (error) {
    console.error(
      "❌ Invalid Groq JSON:",
      cleanedContent
    );

    throw new Error(
      `Groq returned invalid JSON: ${cleanedContent}`
    );
  }

  if (
    !result.type ||
    !result.title ||
    !result.description ||
    !result.severity
  ) {
    throw new Error(
      "Groq response is missing required alert fields"
    );
  }

  // Validate risk score
  result.riskScore = Number(
    result.riskScore
  );

  if (
    Number.isNaN(result.riskScore) ||
    result.riskScore < 0 ||
    result.riskScore > 1
  ) {
    result.riskScore = Number(
      eventData.riskScore || 0
    );
  }

  // Validate confidence
  result.confidence = Number(
    result.confidence
  );

  if (
    Number.isNaN(result.confidence) ||
    result.confidence < 0 ||
    result.confidence > 1
  ) {
    result.confidence = 0.9;
  }

  return result;
};

module.exports = {
  analyzeAlertWithAI,
  generateEmergencyChatReply,
};