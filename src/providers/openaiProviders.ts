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

function extractOutputText(json: any): string {
  if (typeof json?.output_text === "string" && json.output_text.trim()) return json.output_text;

  const output = json?.output;
  if (Array.isArray(output)) {
    for (const item of output) {
      if (Array.isArray(item?.content)) {
        for (const c of item.content) {
          if (c?.type === "output_text" && typeof c?.text === "string") {
            return c.text;
          }
        }
      }
    }
  }

  throw new Error("OpenAI response did not contain output text");
}

async function postOpenAI(body: unknown): Promise<any> {
  if (!env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY missing");

  const res = await fetch(env.OPENAI_BASE_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    throw new Error(`OpenAI failed: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

export class OpenAIVisionProvider implements VisionProvider {
  async analyzeImage(image: Buffer): Promise<VisionOutput> {
    const imageDataUrl = `data:image/jpeg;base64,${image.toString("base64")}`;

    const json = await postOpenAI({
      model: env.VISION_MODEL,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: VISION_SYSTEM_PROMPT }]
        },
        {
          role: "user",
          content: [
            { type: "input_text", text: "Analyze this plant image and return strict VisionOutput JSON only." },
            { type: "input_image", image_url: imageDataUrl }
          ]
        }
      ]
    });

    const payload = JSON.parse(extractOutputText(json));
    return VisionOutputSchema.parse(payload);
  }
}

export class OpenAIReasoningProvider implements ReasoningProvider {
  async recommend(input: VisionOutput): Promise<RecommendationOutput> {
    const json = await postOpenAI({
      model: env.REASONING_MODEL,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: REASONING_SYSTEM_PROMPT }]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Use this VisionOutput JSON and return strict RecommendationOutput JSON only:\n${JSON.stringify(input)}`
            }
          ]
        }
      ]
    });

    const payload = JSON.parse(extractOutputText(json));
    return RecommendationOutputSchema.parse(payload);
  }
}
