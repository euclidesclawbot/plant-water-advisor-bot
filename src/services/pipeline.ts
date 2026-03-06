import type { ReasoningProvider, VisionProvider } from "../providers/interfaces.js";
import {
  RecommendationOutputSchema,
  VisionOutputSchema,
  type RecommendationOutput,
  type VisionOutput
} from "../schemas/contracts.js";

export async function runAnalysisPipeline(
  image: Buffer,
  vision: VisionProvider,
  reasoning: ReasoningProvider
): Promise<{ vision: VisionOutput; recommendation: RecommendationOutput }> {
  const visionRaw = await vision.analyzeImage(image);
  const visionNormalized = VisionOutputSchema.parse(visionRaw);

  const recRaw = await reasoning.recommend(visionNormalized);
  const recommendation = RecommendationOutputSchema.parse(recRaw);

  return { vision: visionNormalized, recommendation };
}
