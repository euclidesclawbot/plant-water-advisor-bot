import type { RecommendationOutput, VisionOutput } from "../schemas/contracts.js";

export interface VisionProvider {
  analyzeImage(image: Buffer): Promise<VisionOutput>;
}

export interface ReasoningProvider {
  recommend(input: VisionOutput): Promise<RecommendationOutput>;
}
