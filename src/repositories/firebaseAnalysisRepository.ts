import { getFirebaseDb } from "../firebase/admin.js";
import type { AnalysisRecord, AnalysisRepository } from "./interfaces.js";

export class FirebaseAnalysisRepository implements AnalysisRepository {
  async save(record: AnalysisRecord): Promise<string> {
    const db = getFirebaseDb();
    const ref = await db.collection("plant_analyses").add(record);
    return ref.id;
  }
}
