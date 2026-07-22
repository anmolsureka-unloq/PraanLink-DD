#!/usr/bin/env bash
#
# PraanLink — one-command setup & launch.
#
# First run: installs Python 3.11 + PostgreSQL (via Homebrew), creates the
# database, creates both Python virtualenvs, installs all dependencies,
# and prompts once for a Gemini API key (and optionally a Hugging Face
# token) to write the .env files.
#
# Every run: starts the AI pipeline (ADK), the backend (FastAPI), and the
# frontend (Vite) together. Press Ctrl+C to stop everything.
#
# Usage:
#   ./start.sh
#
# To skip the interactive prompts (e.g. in CI), export GEMINI_API_KEY
# and/or HF_TOKEN before running.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
AI_PIPELINE_DIR="$ROOT_DIR/ai-pipeline"
VENV_DIR="$ROOT_DIR/venv"
ADK_VENV_DIR="$AI_PIPELINE_DIR/adk-venv"
LOG_DIR="$ROOT_DIR/.run-logs"

DB_NAME="praanlink"
DB_USER="praanlink"
DB_PASS="praanlink"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; BLUE='\033[0;34m'; NC='\033[0m'
info() { echo -e "${BLUE}==>${NC} $1"; }
ok()   { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}!${NC} $1"; }
fail() { echo -e "${RED}✗ $1${NC}"; exit 1; }

echo "=========================================="
echo "  PraanLink — one-command setup & launch"
echo "=========================================="

if [[ "$(uname)" != "Darwin" ]]; then
  warn "This script targets macOS + Homebrew. It may need adjustments on other platforms."
fi

command -v brew >/dev/null 2>&1 || fail "Homebrew is required. Install it from https://brew.sh, then re-run this script."
command -v node >/dev/null 2>&1 || fail "Node.js is required. Install it (e.g. 'brew install node'), then re-run this script."
command -v npm  >/dev/null 2>&1 || fail "npm is required (normally bundled with Node.js)."

# ---------------------------------------------------------------------------
# 1. Python 3.11
# ---------------------------------------------------------------------------
if ! command -v python3.11 >/dev/null 2>&1; then
  info "Installing Python 3.11 via Homebrew..."
  brew install python@3.11
else
  ok "Python 3.11 already installed"
fi
PYTHON311="$(command -v python3.11)"

# ---------------------------------------------------------------------------
# 2. PostgreSQL 16
# ---------------------------------------------------------------------------
if ! brew list postgresql@16 >/dev/null 2>&1; then
  info "Installing PostgreSQL 16 via Homebrew..."
  brew install postgresql@16
else
  ok "PostgreSQL 16 already installed"
fi

info "Starting PostgreSQL..."
brew services start postgresql@16 >/dev/null 2>&1 || true
export PATH="/opt/homebrew/opt/postgresql@16/bin:/usr/local/opt/postgresql@16/bin:$PATH"

info "Waiting for PostgreSQL to accept connections..."
PG_READY=false
for _ in $(seq 1 15); do
  if psql -U "$(whoami)" -d postgres -c "SELECT 1" >/dev/null 2>&1; then
    PG_READY=true
    break
  fi
  sleep 1
done
[[ "$PG_READY" == true ]] || fail "PostgreSQL did not become ready in time. Check 'brew services list' and try again."
ok "PostgreSQL is up"

# ---------------------------------------------------------------------------
# 3. Database + role (idempotent)
# ---------------------------------------------------------------------------
if ! psql -U "$(whoami)" -d postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1; then
  info "Creating database role '${DB_USER}'..."
  psql -U "$(whoami)" -d postgres -c "CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASS}';" >/dev/null
else
  ok "Database role '${DB_USER}' already exists"
fi

if ! psql -U "$(whoami)" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1; then
  info "Creating database '${DB_NAME}'..."
  createdb -O "${DB_USER}" "${DB_NAME}"
else
  ok "Database '${DB_NAME}' already exists"
fi
psql -U "$(whoami)" -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};" >/dev/null

# ---------------------------------------------------------------------------
# 4. Backend virtualenv + dependencies
# ---------------------------------------------------------------------------
if [[ ! -d "$VENV_DIR" ]]; then
  info "Creating backend virtualenv..."
  "$PYTHON311" -m venv "$VENV_DIR"
else
  ok "Backend virtualenv already exists"
fi
info "Installing backend Python dependencies (first run can take a few minutes)..."
"$VENV_DIR/bin/pip" install --upgrade pip -q
"$VENV_DIR/bin/pip" install -r "$BACKEND_DIR/requirements.txt" -q
ok "Backend dependencies installed"

# ---------------------------------------------------------------------------
# 5. AI-pipeline virtualenv + dependencies
# ---------------------------------------------------------------------------
if [[ ! -d "$ADK_VENV_DIR" ]]; then
  info "Creating ai-pipeline virtualenv..."
  "$PYTHON311" -m venv "$ADK_VENV_DIR"
else
  ok "ai-pipeline virtualenv already exists"
fi
info "Installing ai-pipeline Python dependencies..."
"$ADK_VENV_DIR/bin/pip" install --upgrade pip -q
"$ADK_VENV_DIR/bin/pip" install -r "$AI_PIPELINE_DIR/requirements.txt" -q
ok "ai-pipeline dependencies installed"

# ---------------------------------------------------------------------------
# 6. Frontend dependencies
# ---------------------------------------------------------------------------
info "Installing frontend dependencies..."
(cd "$FRONTEND_DIR" && npm install --silent)
ok "Frontend dependencies installed"

# ---------------------------------------------------------------------------
# 7. Environment files — created only if missing, never overwritten
# ---------------------------------------------------------------------------
NEED_KEYS=false
[[ -f "$BACKEND_DIR/.env" ]] || NEED_KEYS=true
[[ -f "$AI_PIPELINE_DIR/.env" ]] || NEED_KEYS=true
[[ -f "$FRONTEND_DIR/.env" ]] || NEED_KEYS=true

GEMINI_KEY="${GEMINI_API_KEY:-}"
HF_KEY="${HF_TOKEN:-}"

if [[ "$NEED_KEYS" == true ]]; then
  echo ""
  info "First-time setup — need a Gemini API key (free at https://aistudio.google.com/apikey)"
  if [[ -z "$GEMINI_KEY" ]] && [[ -t 0 ]]; then
    read -r -p "Gemini API key: " GEMINI_KEY || true
  fi
  [[ -n "$GEMINI_KEY" ]] || { GEMINI_KEY="REPLACE_WITH_GEMINI_API_KEY"; warn "No Gemini API key provided — writing a placeholder. Edit the .env files and re-run to fill it in."; }

  if [[ -z "$HF_KEY" ]] && [[ -t 0 ]]; then
    info "Optional: Hugging Face token, needed only for check-in/insurance audio transcription"
    info "(https://huggingface.co/settings/tokens — accept pyannote/speaker-diarization-3.0 terms first)"
    read -r -p "Hugging Face token (press Enter to skip): " HF_KEY || true
  fi
  [[ -n "$HF_KEY" ]] || HF_KEY="REPLACE_WITH_HUGGINGFACE_TOKEN"
fi

if [[ ! -f "$BACKEND_DIR/.env" ]]; then
  info "Creating backend/.env"
  cat > "$BACKEND_DIR/.env" <<EOF
DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}
GEMINI_API_KEY=${GEMINI_KEY}
ADK_SERVER_URL=http://localhost:5010
HF_TOKEN=${HF_KEY}
GOOGLE_USER_EMAIL=your_sender_gmail_address@gmail.com
GOOGLE_RECEIVER_EMAIL=default_recipient_email@gmail.com
EOF
else
  ok "backend/.env already exists (left untouched)"
fi

if [[ ! -f "$AI_PIPELINE_DIR/.env" ]]; then
  info "Creating ai-pipeline/.env"
  cat > "$AI_PIPELINE_DIR/.env" <<EOF
GOOGLE_GENAI_USE_VERTEXAI=FALSE
GOOGLE_API_KEY=${GEMINI_KEY}
EOF
else
  ok "ai-pipeline/.env already exists (left untouched)"
fi

if [[ ! -f "$FRONTEND_DIR/.env" ]]; then
  info "Creating frontend/.env"
  cat > "$FRONTEND_DIR/.env" <<EOF
VITE_API_URL=http://localhost:8000
VITE_GEMINI_API_KEY=${GEMINI_KEY}
EOF
else
  ok "frontend/.env already exists (left untouched)"
fi

if grep -q "REPLACE_WITH" "$BACKEND_DIR/.env" 2>/dev/null; then
  warn "backend/.env still has placeholder values — edit it and re-run to fill in a real Gemini key / HF token."
fi

if [[ ! -f "$BACKEND_DIR/credentials.json" ]]; then
  warn "backend/credentials.json not found — Gmail/Calendar doctor-escalation features are optional and will report as unconfigured until you add Google OAuth2 credentials (see backend/README.md)."
fi

# ---------------------------------------------------------------------------
# 8. Pre-flight port check
# ---------------------------------------------------------------------------
for port in 5010 8000 8080; do
  if lsof -i ":$port" -sTCP:LISTEN -t >/dev/null 2>&1; then
    fail "Port $port is already in use — stop whatever is running there (maybe a previous ./start.sh) before re-running this script."
  fi
done

# ---------------------------------------------------------------------------
# 9. Launch all three services in the background, then block on `wait` so
#    Ctrl+C (SIGINT) reliably reaches this trap regardless of terminal/job-
#    control setup, instead of relying on a foreground child to propagate it.
# ---------------------------------------------------------------------------
mkdir -p "$LOG_DIR"

info "Starting AI pipeline (ADK) on :5010..."
cd "$AI_PIPELINE_DIR"
"$ADK_VENV_DIR/bin/adk" api_server --allow_origins=http://localhost:8080 --host=0.0.0.0 --port=5010 > "$LOG_DIR/ai-pipeline.log" 2>&1 &
AI_PID=$!
cd "$ROOT_DIR"

info "Starting backend (FastAPI) on :8000..."
cd "$BACKEND_DIR"
"$VENV_DIR/bin/python" main.py > "$LOG_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
cd "$ROOT_DIR"

info "Starting frontend (Vite) on :8080..."
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!
cd "$ROOT_DIR"

# Belt-and-suspenders: also free the ports by lookup, in case any process
# forked into a child with a different PID than the one we captured.
cleanup() {
  echo ""
  info "Shutting down..."
  kill "$AI_PID" "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  wait "$AI_PID" "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  for port in 5010 8000 8080; do
    port_pid="$(lsof -i ":$port" -sTCP:LISTEN -t 2>/dev/null || true)"
    [[ -n "$port_pid" ]] && kill "$port_pid" 2>/dev/null || true
  done
}
trap cleanup EXIT INT TERM

info "Waiting for AI pipeline and backend to become healthy..."
AI_READY=false
for _ in $(seq 1 30); do
  if curl -s -o /dev/null "http://localhost:5010/list-apps"; then AI_READY=true; break; fi
  sleep 1
done
[[ "$AI_READY" == true ]] || warn "AI pipeline didn't respond within 30s — check $LOG_DIR/ai-pipeline.log"

BACKEND_READY=false
for _ in $(seq 1 30); do
  if curl -s -o /dev/null "http://localhost:8000/health"; then BACKEND_READY=true; break; fi
  sleep 1
done
[[ "$BACKEND_READY" == true ]] || warn "Backend didn't respond within 30s — check $LOG_DIR/backend.log"

FRONTEND_READY=false
for _ in $(seq 1 30); do
  if curl -s -o /dev/null "http://localhost:8080/"; then FRONTEND_READY=true; break; fi
  sleep 1
done
[[ "$FRONTEND_READY" == true ]] || warn "Frontend didn't respond within 30s — check .run-logs or the output above"

ok "AI pipeline running (PID $AI_PID) — logs: .run-logs/ai-pipeline.log"
ok "Backend running (PID $BACKEND_PID) — logs: .run-logs/backend.log"
ok "Frontend running (PID $FRONTEND_PID)"

echo ""
echo "=========================================="
ok "Everything is up!"
echo "  Backend API docs:  http://localhost:8000/docs"
echo "  AI pipeline:       http://localhost:5010"
echo "  Frontend:          http://localhost:8080"
echo "=========================================="
echo ""
info "Press Ctrl+C to stop everything (frontend, backend, and AI pipeline)."
echo ""

wait "$AI_PID" "$BACKEND_PID" "$FRONTEND_PID"
