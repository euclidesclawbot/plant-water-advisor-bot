import { runTelegramBot } from "./bot/telegramBot.js";
import { env } from "./config/env.js";
import { WateringAdvisorService } from "./core/wateringAdvisorService.js";
import { makeProviders } from "./providers/factory.js";

async function main() {
  const { vision, reasoning } = makeProviders();
  const advisor = new WateringAdvisorService(vision, reasoning);

  console.log(`Starting Plant Water Advisor Bot | mockMode=${env.MOCK_MODE} | provider=${env.AI_PROVIDER}`);
  await runTelegramBot(advisor, env.POLL_INTERVAL_MS);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
