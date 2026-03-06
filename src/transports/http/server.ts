import { createServer } from "node:http";
import { env } from "../../config/env.js";
import type { AuthProvider } from "../../auth/interfaces.js";
import type { WateringAdvisorService } from "../../core/wateringAdvisorService.js";
import { RecommendationOutputSchema, VisionOutputSchema } from "../../schemas/contracts.js";

function json(res: any, code: number, payload: unknown) {
  res.writeHead(code, { "content-type": "application/json" });
  res.end(JSON.stringify(payload));
}

async function readBody(req: any): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk: Buffer) => (data += chunk.toString("utf8")));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

export function startHttpApi(advisor: WateringAdvisorService, authProvider: AuthProvider) {
  const server = createServer(async (req, res) => {
    try {
      if (req.method === "GET" && req.url === "/health") {
        return json(res, 200, { ok: true });
      }

      if (req.method === "POST" && req.url === "/v1/analyze") {
        const auth = req.headers.authorization;
        if (!auth?.startsWith("Bearer ")) {
          return json(res, 401, { error: "Missing Bearer token" });
        }

        const idToken = auth.slice("Bearer ".length).trim();
        const user = await authProvider.verifyIdToken(idToken);

        const raw = await readBody(req);
        const body = JSON.parse(raw || "{}");

        const imageBase64 = body?.image_base64;
        if (typeof imageBase64 !== "string" || !imageBase64.trim()) {
          return json(res, 400, { error: "image_base64 is required" });
        }

        const image = Buffer.from(imageBase64, "base64");

        const result = await advisor.analyzePlantImage({
          image,
          platform: "web",
          userId: user.uid
        });

        return json(res, 200, {
          record_id: result.recordId,
          vision: VisionOutputSchema.parse(result.vision),
          recommendation: RecommendationOutputSchema.parse(result.recommendation)
        });
      }

      return json(res, 404, { error: "Not found" });
    } catch (err: any) {
      return json(res, 500, { error: err?.message ?? "Internal error" });
    }
  });

  server.listen(env.HTTP_PORT, () => {
    console.log(`HTTP API listening on :${env.HTTP_PORT}`);
  });
}
