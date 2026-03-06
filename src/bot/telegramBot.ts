import { formatAdvice, TEXT_ONLY_HELP } from "../formatters/telegramFormatter.js";
import type { ReasoningProvider, VisionProvider } from "../providers/interfaces.js";
import { basicImageQualityChecks, fetchBestTelegramPhoto, pickBestPhoto } from "../services/imageService.js";
import { runAnalysisPipeline } from "../services/pipeline.js";
import { getUpdates, sendMessage } from "../services/telegramClient.js";
import type { TelegramMessage } from "../types/telegram.js";

export async function runTelegramBot(vision: VisionProvider, reasoning: ReasoningProvider, pollMs: number): Promise<void> {
  let offset = 0;
  console.log("Bot started (polling mode)");

  while (true) {
    try {
      const updates = await getUpdates(offset);
      for (const u of updates) {
        offset = Math.max(offset, u.update_id + 1);
        if (!u.message) continue;
        await handleMessage(u.message, vision, reasoning);
      }
    } catch (err) {
      console.error("Polling error:", err);
    }

    await new Promise((r) => setTimeout(r, pollMs));
  }
}

async function handleMessage(msg: TelegramMessage, vision: VisionProvider, reasoning: ReasoningProvider): Promise<void> {
  const chatId = msg.chat.id;

  if (!msg.photo?.length) {
    await sendMessage(chatId, TEXT_ONLY_HELP);
    return;
  }

  await sendMessage(chatId, "Got your image ✅ Analyzing plant condition now...");

  try {
    const best = pickBestPhoto(msg.photo);
    const qualityIssues = basicImageQualityChecks(best);
    const image = await fetchBestTelegramPhoto(msg.photo);

    const { vision: v, recommendation: r } = await runAnalysisPipeline(image, vision, reasoning);

    const lowConfidence = v.overall_confidence < 0.45 || r.confidence < 0.45;
    const uncertaintyPrefix = lowConfidence
      ? "Low-confidence analysis: image quality/visibility may be insufficient.\n\n"
      : "";

    const qualityPrefix = qualityIssues.length
      ? `Image quality note: ${qualityIssues.join(", ")}.\n\n`
      : "";

    await sendMessage(chatId, `${qualityPrefix}${uncertaintyPrefix}${formatAdvice(v, r)}`);
  } catch (err) {
    console.error("Message handling failed:", err);
    await sendMessage(
      chatId,
      "I couldn’t confidently analyze that image. Please send a clearer photo with the plant and soil visible, ideally in natural light."
    );
  }
}
