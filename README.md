# Plant Water Advisor Bot (Telegram MVP)

MVP Telegram bot that estimates plant watering needs from a photo using a **two-step AI pipeline**:
1) visual analysis model → `VisionOutput` JSON
2) reasoning/validation model → `RecommendationOutput` JSON

The bot is conservative, uncertainty-aware, and designed to swap providers later.

Persistence strategy:
- **Firebase Firestore is the primary database** for production/client-ready flows.
- In `MOCK_MODE`, an in-memory repository is used for local development convenience.

---

## 1) System architecture

```text
                +-----------------------------+
                | Core Application Layer      |
                | WateringAdvisorService      |
                | (pipeline + contracts)      |
                +-------------+---------------+
                              |
                 +------------+------------+
                 |                         |
        +--------v--------+       +--------v--------+
        | Vision Provider |       | Reasoning       |
        | (swappable)     |       | Provider        |
        +-----------------+       +-----------------+

Transport Adapters (modular):
- Telegram Bot adapter (implemented)
- HTTP/Web adapter (implemented MVP endpoint)
- Mobile backend adapter (placeholder)

Auth Layer (future clients):
- Firebase-based auth provider abstraction
- Supports provider login flows (Google now, extensible later)

Current runtime path:
Telegram User
   -> Telegram Bot API (getUpdates)
   -> Telegram Adapter
      -> Image Download Service (best photo resolution)
      -> Core WateringAdvisorService
      -> Analysis Repository (Firestore)
      -> Response Formatter
   -> Telegram sendMessage
```

Design goals:
- modular provider abstraction
- strict schema contracts between stages
- safety-first recommendations
- mock mode for local runs without AI keys
- client-agnostic core to support future web/mobile apps

---

## 2) Folder structure

```text
src/
  auth/
    interfaces.ts
    factory.ts
    firebaseAuthProvider.ts
  bot/
    telegramBot.ts
  config/
    env.ts
  core/
    wateringAdvisorService.ts
  firebase/
    admin.ts
  formatters/
    telegramFormatter.ts
  prompts/
    visionPrompt.ts
    reasoningPrompt.ts
  providers/
    interfaces.ts
    factory.ts
    mockProviders.ts
    openaiProviders.ts
  repositories/
    interfaces.ts
    factory.ts
    firebaseAnalysisRepository.ts
    memoryAnalysisRepository.ts
  schemas/
    contracts.ts
  services/
    telegramClient.ts
    imageService.ts
    pipeline.ts
  transports/
    http/
      httpApiPlaceholder.ts
      server.ts
    mobile/
    telegram/
  types/
    telegram.ts
  index.ts
```

---

## 3) JSON schemas / TypeScript types

Implemented in `src/schemas/contracts.ts` with `zod`:
- `VisionOutputSchema`
- `RecommendationOutputSchema`

Type-safe exports:
- `type VisionOutput`
- `type RecommendationOutput`

All model outputs are validated before use.

---

## 4) Telegram bot flow

1. Poll updates from Telegram API
2. If message has no image:
   - send guidance asking user to upload a plant photo
3. If image exists:
   - acknowledge receipt
   - pick highest-resolution photo size
   - download image from Telegram file API
   - run two-step pipeline
   - format and send structured advice
4. If analysis fails or is low-confidence:
   - return cautious uncertainty message + follow-up questions

---

## 5) Provider abstraction design

Interfaces (`src/providers/interfaces.ts`):
- `VisionProvider.analyzeImage(image: Buffer): Promise<VisionOutput>`
- `ReasoningProvider.recommend(input: VisionOutput): Promise<RecommendationOutput>`

Current implementations:
- `mockProviders.ts` (fully local)
- `openaiProviders.ts` (starter adapter)

Provider selection:
- `src/providers/factory.ts`
- controlled by `MOCK_MODE` and `AI_PROVIDER`

Auth abstraction for future clients:
- `src/auth/interfaces.ts`
- `src/auth/factory.ts`
- `src/auth/firebaseAuthProvider.ts`
- `src/transports/http/httpApiPlaceholder.ts` (Bearer verification helper)

This keeps identity concerns separate from Telegram transport and ready for future web/app clients with Firebase + Google sign-in.

---

## 6) Implementation plan

### Phase 1 (done in this MVP scaffold)
- Telegram polling handler
- image retrieval + best-resolution selection
- two-step provider pipeline
- strict JSON contracts with zod
- safe Telegram formatter
- mock mode support

### Phase 2
- harden OpenAI provider behavior (timeouts, retries, response-format strictness)
- improve low-quality detection (blur/lighting heuristics)
- add retry policy and rate-limit handling

### Phase 3
- persistence (SQLite/Postgres) for user/session history
- reminders and follow-up scheduling
- species-aware logic tuning

---

## 7) Starter code status

Included and runnable locally with mock mode:
- bot handler
- providers abstraction + mock providers
- pipeline with schema validation
- Telegram response formatter

---

## 8) Sample prompts

See:
- `src/prompts/visionPrompt.ts`
- `src/prompts/reasoningPrompt.ts`

Prompt policy highlights:
- vision model: visually inferable facts only
- reasoning model: use only VisionOutput JSON
- conservative + uncertainty-forward outputs

---

## 9) Local development instructions

### Prereqs
- Node.js 20+
- Telegram bot token from BotFather

### Run
```bash
npm install
cp .env.example .env
# set TELEGRAM_BOT_TOKEN
# for production mode also set Firebase credentials in env
npm run dev
```

Then send a photo to your bot in Telegram.

### HTTP API (protected)
When `RUN_HTTP_API=true`, server exposes:
- `GET /health`
- `POST /v1/analyze` (requires Firebase ID token)

Request:
```json
{
  "image_base64": "..."
}
```

Headers:
```text
Authorization: Bearer <firebase_id_token>
Content-Type: application/json
```

### Firestore usage
- Production path: analysis records are stored in `plant_analyses` collection.
- Local/mock path (`MOCK_MODE=true`): in-memory storage only.

---

## 10) Example `.env`

See `.env.example`:

```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_BASE_URL=https://api.telegram.org
POLL_INTERVAL_MS=2500
MOCK_MODE=true
AI_PROVIDER=mock
OPENAI_API_KEY=
OPENAI_BASE_URL=https://api.openai.com/v1/responses
VISION_MODEL=gpt-4.1-mini
REASONING_MODEL=gpt-4.1-mini

# Future web/mobile auth
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

---

## 11) Mock mode behavior

When `MOCK_MODE=true` (or `AI_PROVIDER=mock`):
- no external AI key required
- vision stage returns realistic synthetic `VisionOutput`
- reasoning stage returns conservative `RecommendationOutput`
- full bot flow is testable end-to-end

---

## Firebase sign-in (implemented server verification)

Current status:
- Backend can verify Firebase ID tokens via `FirebaseAuthProvider`.
- This is ready for Google sign-in tokens issued by Firebase Auth on web/mobile clients.

How it works:
1. Client signs in with Firebase Auth (Google provider).
2. Client gets Firebase ID token.
3. Client sends `Authorization: Bearer <idToken>` to backend.
4. Backend verifies token with Firebase Admin and gets `uid/email/provider`.

Required env for non-mock auth:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

Note:
- Telegram flow itself does not require this login step.
- Web/mobile APIs will use this immediately when route layer is added.

## 12) Future roadmap

- user profile memory (species, pot size, watering cadence)
- multi-plant history per Telegram user
- weather/humidity enrichment
- follow-up reminders
- broader care advice (light, repotting, nutrients)
- image history trend tracking

---

## Safety & product behavior notes

- Avoid exact watering volume unless confidence is high
- Prefer cautious guidance when uncertain
- Explicitly separate:
  - observations
  - recommendation
  - uncertainty/safety notes
- Keep a clear disclaimer in every response
