import { env } from "../config/env.js";
import { REASONING_SYSTEM_PROMPT } from "../prompts/reasoningPrompt.js";
import { VISION_SYSTEM_PROMPT } from "../prompts/visionPrompt.js";
import {
  RecommendationOutputSchema,
  VisionOutputSchema,
  type RecommendationOutput,
  type VisionOutput
} from "../schemas/contracts.js";
import type { ReasoningProvider, VisionProvider } from "./interfaces.js";

const OPENAI_URL = "https://api.openai.com/v1/responses";

async function callOpenAI(prompt: string, model: string): Promise<unknown> {
  if (!env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY missing");

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({ model, input: prompt })
  });

  if (!res.ok) throw new Error(`OpenAI failed: ${res.status} ${await res.text()}`);
  const json = await res.json();

  const text = json.output_text as string | undefined;
  if (!text) throw new Error("OpenAI output_text missing");
  return JSON.parse(text);
}

export class OpenAIVisionProvider implements VisionProvider {
  async analyzeImage(_image: Buffer): Promise<VisionOutput> {
    // MVP note: image attachment wiring differs by provider capabilities.
    // This starter sends prompt-only and expects provider-side extension.
    const payload = await callOpenAI(
      `${VISION_SYSTEM_PROMPT}\nReturn JSON only for VisionOutput.`,
      env.VISION_MODEL
    );
    return VisionOutputSchema.parse(payload);
  }
}

export class OpenAIReasoningProvider implements ReasoningProvider {
  async recommend(input: VisionOutput): Promise<RecommendationOutput> {
    const payload = await callOpenAI(
      `${REASONING_SYSTEM_PROMPT}\nInput VisionOutput JSON:\n${JSON.stringify(input)}\nReturn JSON only for RecommendationOutput.`,
      env.REASONING_MODEL
    );
    return RecommendationOutputSchema.parse(payload);
  }
}
