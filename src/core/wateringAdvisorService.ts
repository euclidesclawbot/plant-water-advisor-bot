import type { ReasoningProvider, VisionProvider } from "../providers/interfaces.js";
import { runAnalysisPipeline } from "../services/pipeline.js";

export class WateringAdvisorService {
  constructor(
    private readonly vision: VisionProvider,
    private readonly reasoning: ReasoningProvider
  ) {}

  async analyzePlantImage(image: Buffer) {
    return runAnalysisPipeline(image, this.vision, this.reasoning);
  }
}
