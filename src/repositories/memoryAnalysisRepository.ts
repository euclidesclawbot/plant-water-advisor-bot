import type { AnalysisRecord, AnalysisRepository } from "./interfaces.js";

export class MemoryAnalysisRepository implements AnalysisRepository {
  private readonly store: { id: string; record: AnalysisRecord }[] = [];

  async save(record: AnalysisRecord): Promise<string> {
    const id = `mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    this.store.push({ id, record });
    return id;
  }
}
