import type { AuthProvider, AuthUser } from "./interfaces.js";

/**
 * Future-ready Firebase Auth provider.
 *
 * For MVP Telegram flow this is not required yet, but this module is ready
 * to be used by future web/mobile clients where users sign in with providers
 * like Google.
 */
export class FirebaseAuthProvider implements AuthProvider {
  async verifyIdToken(_idToken: string): Promise<AuthUser> {
    throw new Error("Firebase auth verification not wired yet. Add firebase-admin and credentials.");
  }
}
