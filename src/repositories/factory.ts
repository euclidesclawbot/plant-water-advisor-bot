import { env } from "../config/env.js";
import { FirebaseAnalysisRepository } from "./firebaseAnalysisRepository.js";
import { MemoryAnalysisRepository } from "./memoryAnalysisRepository.js";

export function makeAnalysisRepository() {
  // For local/mock we keep in-memory; for real runtime use Firebase.
  if (env.MOCK_MODE) return new MemoryAnalysisRepository();
  return new FirebaseAnalysisRepository();
}
