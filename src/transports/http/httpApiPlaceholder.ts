import type { AuthProvider } from "../../auth/interfaces.js";
import type { WateringAdvisorService } from "../../core/wateringAdvisorService.js";

/**
 * Future transport adapter (web/mobile clients).
 *
 * This module now includes reusable auth verification helpers,
 * ready to be used by an HTTP framework (Fastify/Express) route layer.
 */
export class HttpApiPlaceholder {
  constructor(
    private readonly advisor: WateringAdvisorService,
    private readonly authProvider: AuthProvider
  ) {
    void this.advisor;
  }

  async verifyBearerToken(authorizationHeader?: string) {
    if (!authorizationHeader?.startsWith("Bearer ")) {
      throw new Error("Missing Bearer token");
    }

    const token = authorizationHeader.slice("Bearer ".length).trim();
    if (!token) throw new Error("Empty Bearer token");

    return this.authProvider.verifyIdToken(token);
  }
}
