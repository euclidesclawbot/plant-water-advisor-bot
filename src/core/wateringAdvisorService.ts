import type { ReasoningProvider, VisionProvider } from "../providers/interfaces.js";
import type { AnalysisRepository } from "../repositories/interfaces.js";
import { runAnalysisPipeline } from "../services/pipeline.js";

interface AnalyzeInput {
  image: Buffer;
  platform: "telegram" | "web" | "mobile";
  userId: string;
  imageMeta?: {
    width?: number;
    height?: number;
    fileSize?: number;
  };
}

export class WateringAdvisorService {
  constructor(
    private readonly vision: VisionProvider,
    private readonly reasoning: ReasoningProvider,
    private readonly repo: AnalysisRepository
  ) {}

  async analyzePlantImage(input: AnalyzeInput) {
    const result = await runAnalysisPipeline(input.image, this.vision, this.reasoning);

    const recordId = await this.repo.save({
      platform: input.platform,
      userId: input.userId,
      imageMeta: input.imageMeta,
      vision: result.vision,
      recommendation: result.recommendation,
      createdAtIso: new Date().toISOString()
    });

    return { ...result, recordId };
  }
}
