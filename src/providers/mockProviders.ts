import type { RecommendationOutput, VisionOutput } from "../schemas/contracts.js";
import type { ReasoningProvider, VisionProvider } from "./interfaces.js";

export class MockVisionProvider implements VisionProvider {
  async analyzeImage(_image: Buffer): Promise<VisionOutput> {
    return {
      plant_type_guess: "houseplant (possible pothos)",
      plant_type_confidence: 0.45,
      pot_size_estimate: "small to medium",
      environment: "indoor",
      soil_moisture_visual_estimate: "slightly_dry",
      leaf_health_signals: {
        drooping: false,
        yellowing: false,
        browning: false,
        curling: false,
        healthy_appearance: true
      },
      light_condition_estimate: "medium",
      plant_size_estimate: "medium",
      observed_risks: ["Topsoil appears somewhat dry"],
      uncertainties: ["Cannot confirm soil moisture below surface", "Species uncertain"],
      overall_confidence: 0.62,
      summary: "Plant appears generally healthy; topsoil may be slightly dry."
    };
  }
}

export class MockReasoningProvider implements ReasoningProvider {
  async recommend(input: VisionOutput): Promise<RecommendationOutput> {
    const cautious = input.overall_confidence < 0.55 || input.soil_moisture_visual_estimate === "unclear";

    if (cautious) {
      return {
        watering_need: "monitor",
        estimated_amount: "Hold watering for now; re-check soil by touch at 2-3 cm depth",
        confidence: 0.45,
        reasoning_summary: "Visual confidence is limited, so conservative monitoring is safer than immediate watering.",
        validation_notes: ["Recommendation constrained by uncertainty"],
        risk_warnings: ["Overwatering risk if soil is already moist below surface"],
        follow_up_questions: ["What is the plant species?", "Does the pot have drainage holes?", "When was last watering?"],
        disclaimer: "Plant care depends on species, climate, soil mix, drainage, and season."
      };
    }

    return {
      watering_need: "light_water",
      estimated_amount: "~5-10% of pot volume, slowly, until slight drainage",
      confidence: 0.68,
      reasoning_summary: "Topsoil appears slightly dry while leaves look healthy; light watering is a cautious option.",
      validation_notes: ["Avoid full saturation unless deeper soil is dry"],
      risk_warnings: ["Stop if soil still feels moist below surface"],
      follow_up_questions: ["Can you check soil moisture 2-3 cm deep?"],
      disclaimer: "Plant care depends on species, climate, soil mix, drainage, and season."
    };
  }
}
