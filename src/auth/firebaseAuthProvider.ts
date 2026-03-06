import { getAuth } from "firebase-admin/auth";
import { getFirebaseDb } from "../firebase/admin.js";
import type { AuthProvider, AuthUser } from "./interfaces.js";

/**
 * Firebase Auth provider.
 *
 * Verifies Firebase ID tokens issued by client sign-in flows
 * (e.g., Google provider via Firebase Auth on web/mobile).
 */
export class FirebaseAuthProvider implements AuthProvider {
  async verifyIdToken(idToken: string): Promise<AuthUser> {
    // Ensures Firebase app is initialized through shared bootstrap.
    getFirebaseDb();

    const decoded = await getAuth().verifyIdToken(idToken);
    const provider = decoded.firebase?.sign_in_provider;

    return {
      uid: decoded.uid,
      email: decoded.email,
      provider
    };
  }
}
