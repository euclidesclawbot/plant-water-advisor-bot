import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const EnvSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  TELEGRAM_BASE_URL: z.string().default("https://api.telegram.org"),
  POLL_INTERVAL_MS: z.coerce.number().default(2500),
  MOCK_MODE: z.string().default("true").transform((v) => v === "true"),
  AI_PROVIDER: z.enum(["mock", "openai"]).default("mock"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_BASE_URL: z.string().default("https://api.openai.com/v1/responses"),
  VISION_MODEL: z.string().default("gpt-4.1-mini"),
  REASONING_MODEL: z.string().default("gpt-4.1-mini"),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional()
});

export const env = EnvSchema.parse(process.env);
