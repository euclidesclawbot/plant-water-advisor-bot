import type { WateringAdvisorService } from "../../core/wateringAdvisorService.js";
import type { AuthProvider } from "../../auth/interfaces.js";

/**
 * Future transport adapter (web/mobile clients).
 *
 * This placeholder shows where REST handlers + auth middleware will live.
 */
export class HttpApiPlaceholder {
  constructor(
    private readonly advisor: WateringAdvisorService,
    private readonly authProvider: AuthProvider
  ) {
    void this.advisor;
    void this.authProvider;
  }
}
