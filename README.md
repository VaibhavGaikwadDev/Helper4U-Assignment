# Smart Match Summary & Audio Prompt Engine

A mini end-to-end flow for Helper4U: an employer types or records a requirement,
an LLM turns it into structured tags, MySQL finds candidate helpers, and a
second LLM call writes a short, friendly justification for each match.

```
React (text/audio) → Node/Express → OpenAI (extract tags) → MySQL (candidates)
                                   → OpenAI (write justifications) → React (result cards)
```

## Stack

- **Backend:** Node.js (Express) + MySQL (`mysql2`), OpenAI API (JSON mode + Whisper)
- **Frontend:** React (Vite) — chosen over Android per the assignment's "React web view" option, to keep the UI layer thin and focus effort on the AI/DB pipeline
- **Everything else:** plain `fetch`/`FormData`/`Blob` (Node 18+ globals), no extra HTTP client needed

## Project structure

```
smart-match-assignment/
├── sql/
│   └── schema.sql              # helpers table + 15 seed rows
├── backend/
│   ├── .env.example
│   └── src/
│       ├── server.js           # Express app entry point
│       ├── config/db.js        # MySQL connection pool
│       ├── middleware/upload.js # multer (in-memory audio upload)
│       ├── routes/matchHelper.js
│       ├── controllers/matchController.js  # orchestrates the whole flow
│       ├── services/
│       │   ├── llmService.js   # Step A (extract) + Step C (summarize)
│       │   ├── audioService.js # Whisper transcription
│       │   └── helperService.js # Step B: parameterized query + fallback + ranking
│       └── utils/
│           ├── prompts.js      # the two system prompts, JSON-mode schemas
│           └── scoring.js      # ranking function — see "Live-modify demo" below
└── frontend/
    └── src/
        ├── App.jsx
        ├── components/ (RequirementForm, AudioRecorder, ResultCard, LoadingSpinner)
        └── api/matchApi.js
```

## Setup

### Prerequisites

- Node.js 18+ (uses native `fetch`/`FormData`/`Blob` — no SDK dependency for the OpenAI calls)
- MySQL 8+ running locally
- An OpenAI API key with access to a chat model and Whisper

### 1. Database

```bash
mysql -u root -p < sql/schema.sql
```

This creates the `smart_match` database, the `helpers` table, and seeds it
with 15 helper profiles across Cook, Nanny, Elder Care, Driver, Maid, and
Cleaner roles (Mumbai-area locations, matching the assignment's example).

### 2. Backend

```bash
cd backend
cp .env.example .env      # fill in DB_PASSWORD and OPENAI_API_KEY
npm install
npm run dev                # http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173, proxies /api → :5000
```

Open `http://localhost:5173`, type (or record) a requirement like:

> "Looking for an experienced cook who can make Maharashtrian food and stay till 8 PM, urgent"

## API

**`POST /api/match-helper`**

Either JSON:
```json
{ "requirementText": "Looking for an experienced cook..." }
```
or `multipart/form-data` with an `audio` file field (optionally alongside `requirementText`).

Response:
```json
{
  "success": true,
  "employerText": "...",
  "extractedCriteria": { "skill": "Cook", "sub_skill": "Maharashtrian", "timing": "Evening", "urgency": true, "location": null, "raw_notes": "..." },
  "matches": [
    {
      "id": 1, "name": "Sunita Pawar", "primarySkill": "Cook",
      "subSkills": "Maharashtrian, North Indian", "shiftPreference": "Evening",
      "experienceYears": 6, "locationArea": "Andheri West", "isImmediatelyAvailable": true,
      "matchSummary": "Sunita is a great match because..."
    }
  ]
}
```

## Design notes

- **JSON mode, not free-text parsing:** both LLM calls use OpenAI's
  `response_format: { type: "json_object" }` with a strict schema in the
  system prompt (`utils/prompts.js`), so responses are reliably parseable
  instead of needing regex/markdown-fence stripping.
- **Parameterized queries throughout:** `helperService.js` builds SQL with
  `?` placeholders via `mysql2`, never string-concatenates user input.
- **Two-stage matching:** Step B first queries on skill *and* sub-skill; if
  that returns nothing, it falls back to skill-only and re-ranks in
  JavaScript (`utils/scoring.js`) using timing, urgency, experience, and
  location as weighted signals. This keeps the DB query simple and puts all
  ranking logic in one small, easy-to-read function.
- **Failure isolation:** transcription, extraction, and summarization each
  fail independently — a broken Whisper call returns a clear error, but a
  failed summary call falls back to a templated sentence rather than losing
  the whole match result.
- **Batched summaries:** Step C sends all candidate helpers in a single LLM
  call (asking for a JSON array of summaries) rather than one call per
  helper, to keep latency and cost down.

### Live-modify demo

`utils/scoring.js` intentionally isolates ranking in one pure function,
`scoreHelper(helper, criteria)`. Swapping the strategy — e.g. "prioritize
distance instead of timing" — means editing that one function: drop (or
lower the weight of) the timing block, and add a distance term using the
already-present `latitude`/`longitude` columns and the included
`haversineKm` helper (kept in the same file, commented, ready to wire in).

## Known trade-offs (given the scope)

- `sub_skills` is a comma-separated string rather than a normalized join
  table — reasonable for a 15-row demo table, would move to
  `helper_skills(helper_id, skill)` at real scale.
- Location matching is a loose substring check against the LLM-extracted
  area name, not geocoding — the lat/lng columns exist so this could be
  upgraded to real distance-based ranking (see above) without a schema change.
- No auth/rate-limiting — out of scope for this assignment, would be needed
  before any real deployment.
