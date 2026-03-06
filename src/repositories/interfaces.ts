import type { RecommendationOutput, VisionOutput } from "../schemas/contracts.js";

export interface AnalysisRecord {
  platform: "telegram" | "web" | "mobile";
  userId: string;
  imageMeta?: {
    width?: number;
    height?: number;
    fileSize?: number;
  };
  vision: VisionOutput;
  recommendation: RecommendationOutput;
  createdAtIso: string;
}

export interface AnalysisRepository {
  save(record: AnalysisRecord): Promise<string>;
}
