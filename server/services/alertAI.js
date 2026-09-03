const analyzeAlertWithAI = async (eventData) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing");
  }

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
- type must be: Flood Warning, Flood, Earthquake, Landslide, Fire, Storm, SOS Emergency, Victim Detected, System Alert
- severity must be: LOW, MEDIUM, HIGH, CRITICAL
- riskScore must be between 0 and 1
- confidence must be between 0 and 1
- Return JSON only.
- No markdown.
`;

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },

      body: JSON.stringify({
        model: "openai/gpt-oss-20b",

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

        // Increased because gpt-oss may need
        // more completion tokens to produce valid JSON.
        max_completion_tokens: 800,

        response_format: {
          type: "json_object",
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Groq API error (${response.status}): ${errorText}`
    );
  }

  const data = await response.json();

  const content =
    data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Groq returned an empty response");
  }

  console.log("🤖 Groq response:", content);

  let cleanedContent = content
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
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

  // Validate required fields
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

  // Normalize risk score
  result.riskScore = Number(result.riskScore);

  if (
    Number.isNaN(result.riskScore) ||
    result.riskScore < 0 ||
    result.riskScore > 1
  ) {
    result.riskScore = Number(
      eventData.riskScore || 0
    );
  }

  // Normalize confidence
  result.confidence = Number(result.confidence);

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
};