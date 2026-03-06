import type { RecommendationOutput, VisionOutput } from "../schemas/contracts.js";

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

export function formatAdvice(vision: VisionOutput, rec: RecommendationOutput): string {
  return [
    "Plant observations:",
    `- probable plant type: ${vision.plant_type_guess} (${pct(vision.plant_type_confidence)})`,
    `- soil appearance: ${vision.soil_moisture_visual_estimate}`,
    `- leaf condition: ${vision.leaf_health_signals.healthy_appearance ? "generally healthy" : "possible stress signs"}`,
    `- light estimate: ${vision.light_condition_estimate}`,
    `- confidence: ${pct(vision.overall_confidence)}`,
    "",
    "Recommendation:",
    `- watering need: ${rec.watering_need}`,
    `- estimated amount: ${rec.estimated_amount}`,
    `- explanation: ${rec.reasoning_summary}`,
    "",
    "Safety notes:",
    ...rec.risk_warnings.map((n) => `- ${n}`),
    ...rec.validation_notes.map((n) => `- ${n}`),
    "",
    "Follow-up:",
    ...(rec.follow_up_questions.length ? rec.follow_up_questions.map((q) => `- ${q}`) : ["- No follow-up needed right now"]),
    "",
    "Disclaimer:",
    `- ${rec.disclaimer}`
  ].join("\n");
}

export const TEXT_ONLY_HELP = [
  "I work best with a plant photo 🌿",
  "Please send a clear image of the plant and visible soil.",
  "Optional details that help:",
  "- plant type",
  "- pot size",
  "- symptoms (drooping, yellow leaves, dry tips)",
].join("\n");
