import { env } from "../config/env.js";
import { FirebaseAuthProvider } from "./firebaseAuthProvider.js";
import type { AuthProvider } from "./interfaces.js";

class MockAuthProvider implements AuthProvider {
  async verifyIdToken(_idToken: string) {
    return {
      uid: "mock-user",
      email: "mock@example.com",
      provider: "mock"
    };
  }
}

export function makeAuthProvider(): AuthProvider {
  if (env.MOCK_MODE) return new MockAuthProvider();
  return new FirebaseAuthProvider();
}
