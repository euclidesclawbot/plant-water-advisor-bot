import { runTelegramBot } from "./bot/telegramBot.js";
import { env } from "./config/env.js";
import { makeProviders } from "./providers/factory.js";

async function main() {
  const { vision, reasoning } = makeProviders();
  console.log(`Starting Plant Water Advisor Bot | mockMode=${env.MOCK_MODE} | provider=${env.AI_PROVIDER}`);
  await runTelegramBot(vision, reasoning, env.POLL_INTERVAL_MS);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
