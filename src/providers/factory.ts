import { env } from "../config/env.js";
import { MockReasoningProvider, MockVisionProvider } from "./mockProviders.js";
import { OpenAIReasoningProvider, OpenAIVisionProvider } from "./openaiProviders.js";

export function makeProviders() {
  if (env.MOCK_MODE || env.AI_PROVIDER === "mock") {
    return {
      vision: new MockVisionProvider(),
      reasoning: new MockReasoningProvider()
    };
  }

  return {
    vision: new OpenAIVisionProvider(),
    reasoning: new OpenAIReasoningProvider()
  };
}
