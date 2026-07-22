# PraanLink — Setup Status & Run Instructions

## Current blocker
The Gemini API key in `backend/.env` (also copied to `ai-pipeline/.env` and
`frontend/.env`) is valid and authorized, but the underlying AI Studio project
has **no prepayment credits** (`429 RESOURCE_EXHAUSTED`). Add billing at
https://ai.studio/projects, then everything below should work end-to-end.

## One-time setup already done on this machine
- Homebrew Python 3.11 + PostgreSQL 16 installed; `postgresql@16` running as a brew service.
- Database created: `praanlink` (role `praanlink` / password `praanlink`), 6 tables auto-created on backend boot.
- `venv/` (repo root) — backend deps installed, Python 3.11.
- `ai-pipeline/adk-venv/` — ai-pipeline deps installed (just `google-adk` + `python-dotenv`), Python 3.11.
- `frontend/node_modules/` — installed via `npm install`; `npm run build` verified clean.
- `.env` files created in `backend/`, `ai-pipeline/`, `frontend/` (see `.env.example` in each for the full variable list).

## Running the app (3 terminals)

**Terminal 1 — AI pipeline (ADK agents), must start first:**
```bash
cd PraanLink/ai-pipeline
source adk-venv/bin/activate
adk api_server --allow_origins=http://localhost:8000 --host=0.0.0.0 --port=5010
```
Verify: `curl http://localhost:5010/list-apps` → should list
`conversation_summarizer_agent`, `lab_report_agent`, `prescription_agent`, `report_agent`.

**Terminal 2 — Backend (FastAPI):**
```bash
cd PraanLink/backend
source ../../venv/bin/activate   # repo-root venv
python main.py
```
Verify: `curl http://localhost:8000/health` → `{"status":"healthy"}`.
Also make sure PostgreSQL is running: `brew services start postgresql@16` (if not already).

**Terminal 3 — Frontend:**
```bash
cd PraanLink/frontend
npm run dev
```
Open http://localhost:8080 (see `vite.config.ts`).

## Still optional / needs your attention later
- **Gmail/Calendar (doctor escalation feature):** `backend/credentials.json` and
  `backend/token.json` already contain real OAuth credentials from a prior setup,
  but the access token's recorded expiry (2025-11-02) is in the past — the
  refresh token should auto-renew it on first use; if it fails, re-run
  `python utils/google_auth_setup.py` from `backend/` to redo the OAuth flow.
  **Given these credentials were previously exposed in git history, consider
  regenerating the OAuth client in Google Cloud Console and re-running the
  auth flow with fresh credentials.**
- **Security cleanup (see chat for full detail):** rotate the Gemini key,
  OAuth client secret, and refresh token that were previously committed to
  this repo's public git history — none of the local fixes here undo that
  exposure.
- `backend/uploads/` already has some real recorded audio (`.wav`) and
  transcripts tracked in git from earlier testing — worth deciding whether
  that should stay tracked in a public repo.
