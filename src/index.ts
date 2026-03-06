import { makeAuthProvider } from "./auth/factory.js";
import { runTelegramBot } from "./bot/telegramBot.js";
import { env } from "./config/env.js";
import { WateringAdvisorService } from "./core/wateringAdvisorService.js";
import { makeProviders } from "./providers/factory.js";
import { makeAnalysisRepository } from "./repositories/factory.js";
import { startHttpApi } from "./transports/http/server.js";

async function main() {
  const { vision, reasoning } = makeProviders();
  const repo = makeAnalysisRepository();
  const advisor = new WateringAdvisorService(vision, reasoning, repo);
  const authProvider = makeAuthProvider();

  console.log(`Starting Plant Water Advisor | mockMode=${env.MOCK_MODE} | provider=${env.AI_PROVIDER}`);

  if (env.RUN_HTTP_API) {
    startHttpApi(advisor, authProvider);
  }

  if (env.RUN_TELEGRAM_BOT) {
    await runTelegramBot(advisor, env.POLL_INTERVAL_MS);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
