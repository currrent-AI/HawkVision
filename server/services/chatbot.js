// Emergency chatbot reply generator.
// Rule-based for now — replace the internals of generateReply
// with an AI provider call (e.g. Alibaba Cloud Qwen) later
// without touching the route layer.

const rules = [
  {
    keywords: ["shelter", "safe place"],
    reply:
      "I can help you find a nearby emergency shelter. Please share your location so HawkVision can identify the closest available shelter and its current capacity.",
  },
  {
    keywords: ["flood", "water"],
    reply:
      "⚠️ Flood emergency detected. Move to higher ground immediately and avoid walking or driving through moving water. HawkVision recommends checking nearby shelters and evacuation routes.",
  },
  {
    keywords: ["fire"],
    reply:
      "🔥 Fire emergency detected. Move away from the affected area immediately. Avoid smoke-filled areas and do not use elevators. If you are trapped, stay low and signal for assistance.",
  },
  {
    keywords: ["sos", "help"],
    reply:
      "🚨 Emergency assistance detected. If this is a life-threatening situation, open the SOS Control to escalate your location and emergency status to the response network.",
  },
  {
    keywords: ["earthquake"],
    reply:
      "⚠️ Earthquake emergency detected. Move away from windows and unstable structures. Once shaking stops, move to an open and safe area and follow official evacuation instructions.",
  },
  {
    keywords: ["hello", "hi"],
    reply:
      "Hello. I'm HawkVision Emergency AI. You can ask me about floods, fires, shelters, evacuation guidance, emergency contacts or SOS assistance.",
  },
];

const fallbackReply =
  "I understand your request. Please provide your current location and describe the emergency in more detail so I can provide more targeted guidance.";

async function generateReply(message) {
  const lowerText = message.toLowerCase();

  for (const rule of rules) {
    if (
      rule.keywords.some((keyword) =>
        new RegExp(`\\b${keyword}\\b`).test(lowerText)
      )
    ) {
      return rule.reply;
    }
  }

  return fallbackReply;
}

module.exports = { generateReply };
