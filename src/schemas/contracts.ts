import { z } from "zod";

export const VisionOutputSchema = z.object({
  plant_type_guess: z.string(),
  plant_type_confidence: z.number().min(0).max(1),
  pot_size_estimate: z.string(),
  environment: z.enum(["indoor", "outdoor", "unknown"]),
  soil_moisture_visual_estimate: z.enum(["dry", "slightly_dry", "moist", "wet", "unclear"]),
  leaf_health_signals: z.object({
    drooping: z.boolean(),
    yellowing: z.boolean(),
    browning: z.boolean(),
    curling: z.boolean(),
    healthy_appearance: z.boolean()
  }),
  light_condition_estimate: z.enum(["low", "medium", "bright", "direct_sun", "unclear"]),
  plant_size_estimate: z.enum(["small", "medium", "large", "unclear"]),
  observed_risks: z.array(z.string()),
  uncertainties: z.array(z.string()),
  overall_confidence: z.number().min(0).max(1),
  summary: z.string()
});

export const RecommendationOutputSchema = z.object({
  watering_need: z.enum(["no_water_now", "monitor", "light_water", "moderate_water", "uncertain"]),
  estimated_amount: z.string(),
  confidence: z.number().min(0).max(1),
  reasoning_summary: z.string(),
  validation_notes: z.array(z.string()),
  risk_warnings: z.array(z.string()),
  follow_up_questions: z.array(z.string()),
  disclaimer: z.string()
});

export type VisionOutput = z.infer<typeof VisionOutputSchema>;
export type RecommendationOutput = z.infer<typeof RecommendationOutputSchema>;
