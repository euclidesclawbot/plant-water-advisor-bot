export interface AuthUser {
  uid: string;
  email?: string;
  provider?: string;
}

export interface AuthProvider {
  verifyIdToken(idToken: string): Promise<AuthUser>;
}
