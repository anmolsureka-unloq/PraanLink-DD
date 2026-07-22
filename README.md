# PraanLink

> **🏆 Winner — Healthcare Hackathon @ IIT Bombay (organized by Loop Health)
Empathy meets intelligence — your proactive health steward walking with you every step of the way.**

PraanLink reimagines healthcare as a continuous conversation, blending empathy with intelligence. Its goal is to detect health issues before they become critical, making healthcare proactive instead of reactive.


---

## 🧠 Overview

PraanLink is a continuous-care companion that proactively manages your health journey through:

- **Continuous Care**: Regular, conversational check-ins that learn your patterns and detect anomalies early
- **Contextual Intelligence**: Analyzes your health history, reports, and conversations to spot trends before they become problems
- **Connected Ecosystem**: Bridges patients, doctors, and insurers with full context

This is not an emergency tool — it's more like a health coach that walks with you every step of the way.

---

## 🚨 The Problem

People delay seeking medical help due to:

- **Time, complexity, and language barriers** preventing access to care
- **Fragmented health data** (lab reports, prescriptions, chats) that is scattered and underused
- **No continuous health record** maintaining context across time
- **Missed early warning signs** leading to avoidable hospitalizations and costs
- **Insurance confusion** making it hard to find the right policy

---

## 💡 The Solution

PraanLink addresses these challenges through:

1. **Routine Human-like Conversations**
   - "Hey Ananya, your energy's been low this week. Shall we check your iron levels?"
   - Multilingual, empathetic, natural conversations powered by Gemini Live API

2. **Lab & Prescription Uploads**
   - Auto-parses medical documents with OCR
   - Provides insights with zero manual data entry

3. **AI-Generated Health Reports**
   - Detects trends, anomalies, and lifestyle recommendations
   - Comprehensive analysis across all health data

4. **Doctor Escalation**
   - Finds suitable doctors and books appointments
   - Sends context summaries to doctors before consultations

5. **Insurance Guidance**
   - Recommends insurance plans using embeddings + RAG-based matching
   - Personalized recommendations based on health profile

---

## ⚙️ Tech Stack

### Frontend
- **React** + **TypeScript** + **Vite** - Modern, fast development
- **Mobile-first UI** - Single decorative phone frame on desktop, bottom tab navigation, native-feeling on mobile
- **Gemini Live API** + **WebSockets** - Real-time, bilingual conversations
- **shadcn/ui** + **Tailwind CSS** + **Framer Motion** - Premium, animated, responsive UI
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and state management

### Backend
- **FastAPI** - High-performance Python web framework
- **PostgreSQL** + **SQLAlchemy** - Robust data storage and ORM
- **Google ADK** - Scalable orchestration of multiple AI agents
- **WhisperX** - Audio transcription and diarization
- **Uvicorn** - ASGI server

### AI Pipeline
- **Google ADK (Agent Development Kit)** - Multi-agent orchestration
- **Gemini Flash** - Medical text analysis and generation
- **Medical OCR** - Document processing
- **RAG (Retrieval-Augmented Generation)** - Insurance plan matching
- **Embeddings** - Semantic search for insurance recommendations

### Design Philosophy
Scalable, modular, and explainable — grows with your health needs.

---

## 🧩 Multi-Agent Architecture

### 1. **Multilingual Conversational Agent**
- Uses Gemini Live API + WebSockets for instant dialogue
- Retains memory and personalization
- Supports English and Hindi with natural conversation flow

### 2. **Lab Reports & Prescription Analysis Suite**
- **Lab Report Agent**: Extracts data from medical PDFs, flags abnormal parameters, calculates risk
  - Lab Parser: OCR and extraction
  - Lab Analyzer: Pattern detection
  - Lab Risk Scorer: Risk assessment
  - Lab Summarizer: Patient-friendly summaries
- **Prescription Agent**: Extracts structured prescription data, medication tracking, adherence monitoring

### 3. **Medical Report Agent**
- Synthesizes conversations + reports into structured clinical summaries
- **Timeline Builder**: Organizes health data chronologically
- **Trend Analyzer**: Detects changes in parameters over time
- **Risk Scorer**: Computes personalized health risk indices
- **Disease Inference**: Suggests possible conditions
- **Medication Aggregator**: Tracks prescription adherence & interactions
- **Patient Report Generator**: Converts data into clear summaries
- **Report Aggregator**: Creates comprehensive dossiers for doctors or insurers

### 4. **Insurance Agent**
- Uses embeddings and retrieval-augmented generation (RAG) to suggest insurance plans
- Personalized recommendations based on health profile and needs

### 5. **Core Orchestrator**
- ADK-based coordination layer for seamless inter-agent communication
- Modular design = easily expandable to new domains (mental health, women's wellness, etc.)

---

## 📊 Medical Report Generation Pipeline

The report generation process follows a **7-step pipeline**:

1. **Timeline Builder** – Organizes health data chronologically
2. **Trend Analyzer** – Detects changes in parameters over time
3. **Risk Scorer** – Computes personalized health risk indices
4. **Disease Inference** – Suggests possible conditions based on symptoms and labs
5. **Medication Aggregator** – Tracks prescription adherence & interactions
6. **Patient Report Generator** – Converts data into clear, patient-friendly summaries
7. **Report Aggregator** – Creates comprehensive dossiers for doctors or insurers

**Result**: A doctor-ready health story providing full context before consultation.

---

## 🧬 Gemini Live Integration

### Real-Time Conversational Intelligence
- **Gemini Live API** + **WebSockets** for instant dialogue
- Multilingual support with low latency
- Contextual memory keeps conversation history relevant
- Emotional Intelligence: conversational and compassionate tone
- Feels like a human companion, not a clinical bot

### Features
- Real-time audio streaming (bidirectional)
- Natural interruptions and turn-taking
- Voice synthesis with multiple voice options
- Tool calling capabilities for medical knowledge search and history access 

---

## 🌍 Alignment with Healthcare Vision

| Challenge | PraanLink Solution |
|-----------|-------------------|
| Lack of accessible care | Multilingual, low-bandwidth, continuous monitoring |
| Scattered health data | Multi-agent insight engine converting PDFs into readable insights |
| Explainable AI | Consent-centric, clinician-audited summaries |
| Inefficient workflows | Automated coordination + insurance guidance |

**Empathy + Engineering = Prevention for All**

---

## 🚀 Quick Start

The fastest way to get **everything** running — backend, AI pipeline, and frontend — is the one-command setup script at the repo root:

```bash
git clone <repository-url>
cd PraanLink
./start.sh
```

**First run**, `start.sh` will (macOS + [Homebrew](https://brew.sh) required):
- Install Python 3.11 and PostgreSQL 16 if not already present
- Create the `praanlink` database and role
- Create both Python virtualenvs (repo-root `venv/` for the backend, `ai-pipeline/adk-venv/` for the AI pipeline) and install all dependencies
- Install frontend (`npm`) dependencies
- Prompt you once for a **Gemini API key** (free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)) and, optionally, a **Hugging Face token** (only needed for check-in/insurance audio transcription — see [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)), then write `backend/.env`, `ai-pipeline/.env`, and `frontend/.env`

**Every run** (including the first), it starts all three services together and waits for each to become healthy:
- AI pipeline (Google ADK) — `http://localhost:5010`
- Backend (FastAPI) — `http://localhost:8000` ([API docs](http://localhost:8000/docs))
- Frontend (Vite) — `http://localhost:8080`

Press `Ctrl+C` to stop all three. Re-running `./start.sh` any time is safe — it skips whatever's already installed/configured and **never overwrites an existing `.env` file**.

Optional, not required to get started:
- **Gmail/Calendar (doctor-escalation feature):** needs `backend/credentials.json` — a Google OAuth2 client downloaded from Google Cloud Console — plus a one-time `python utils/google_auth_setup.py` run from `backend/` (with the backend venv activated) to generate `backend/token.json`. Without it, the escalation feature reports itself as unconfigured but everything else works normally.
- To skip the interactive prompts (e.g. scripted setup), export `GEMINI_API_KEY` and/or `HF_TOKEN` before running `./start.sh`.

> `start.sh` targets macOS + Homebrew (verified). On another platform, follow **Manual Setup** below instead.

### Manual Setup (advanced / non-macOS)

**Prerequisites:** Python 3.11+, Node.js 18+, PostgreSQL, a Gemini API key.

1. **Database**
   ```bash
   createdb praanlink   # or create a role/database matching your DATABASE_URL below
   ```

2. **Backend**
   ```bash
   cd backend
   python3.11 -m venv ../venv        # a shared venv one level up, or your own venv/ here
   ../venv/bin/pip install -r requirements.txt
   cp .env.example .env              # then edit DATABASE_URL / GEMINI_API_KEY / HF_TOKEN
   ../venv/bin/python main.py
   ```
   Runs on `http://localhost:8000` — API docs at `/docs`, health check at `/health`.

3. **AI Pipeline** (separate terminal)
   ```bash
   cd ai-pipeline
   python3.11 -m venv adk-venv
   adk-venv/bin/pip install -r requirements.txt
   cp .env.example .env               # set GOOGLE_API_KEY to the same Gemini key
   adk-venv/bin/adk api_server --allow_origins=http://localhost:8080 --host=0.0.0.0 --port=5010
   ```
   Runs on `http://localhost:5010`.

4. **Frontend** (separate terminal)
   ```bash
   cd frontend
   npm install
   cp .env.example .env                # set VITE_GEMINI_API_KEY to the same Gemini key
   npm run dev
   ```
   Runs on `http://localhost:8080`.

#### Environment variables

**`backend/.env`**
```env
DATABASE_URL=postgresql://praanlink:praanlink@localhost:5432/praanlink
GEMINI_API_KEY=your_gemini_api_key
ADK_SERVER_URL=http://localhost:5010
HF_TOKEN=your_huggingface_token          # optional — audio transcription only
GOOGLE_USER_EMAIL=your_sender_gmail_address@gmail.com      # optional — Gmail escalation
GOOGLE_RECEIVER_EMAIL=default_recipient_email@gmail.com    # optional
```

**`ai-pipeline/.env`**
```env
GOOGLE_GENAI_USE_VERTEXAI=FALSE
GOOGLE_API_KEY=your_gemini_api_key
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:8000
VITE_GEMINI_API_KEY=your_gemini_api_key
```

All three `GEMINI_API_KEY` / `GOOGLE_API_KEY` / `VITE_GEMINI_API_KEY` values are the same key — get one at [aistudio.google.com/apikey](https://aistudio.google.com/apikey). None of the `.env` files are committed to git — never commit real keys.

---

## 📁 Project Structure

```
PraanLink/
├── start.sh                 # One-command setup + launch script (see Quick Start)
├── docs/superpowers/         # Design specs and implementation plans
│
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── PhoneFrame.tsx   # Decorative mobile device frame (desktop only)
│   │   │   ├── BottomNav.tsx    # Mobile bottom tab navigation
│   │   │   └── Layout.tsx       # App shell: header + routed content + bottom nav
│   │   ├── pages/          # Page components
│   │   │   ├── CheckIn.tsx      # Weekly health check-ins
│   │   │   ├── Upload.tsx      # Document upload (lab reports, prescriptions)
│   │   │   ├── Summaries.tsx   # Health report summaries
│   │   │   ├── Appointments.tsx # Doctor appointment management
│   │   │   ├── AgentCall.tsx    # AI agent calling hospital
│   │   │   └── Insurance.tsx    # Insurance consultation
│   │   ├── utils/          # Utility functions
│   │   │   ├── gemini-live-api.js  # Gemini Live API wrapper
│   │   │   ├── audio-recorder.js   # Audio recording utilities
│   │   │   └── audio-streamer.js   # Audio playback utilities
│   │   └── App.tsx         # Main app component
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                 # FastAPI backend
│   ├── db/
│   │   ├── database.py     # Database connection
│   │   └── models.py       # SQLAlchemy models
│   ├── routers/            # API route handlers
│   │   ├── checkins.py     # Check-in endpoints
│   │   ├── prescriptions.py # Prescription endpoints
│   │   ├── reports.py      # Report endpoints
│   │   ├── hospitals.py    # Hospital endpoints
│   │   ├── insurances.py   # Insurance endpoints
│   │   └── appointments.py # Appointment + Gmail/Calendar escalation endpoints
│   ├── utils/              # Utility functions
│   │   ├── transcribe.py   # Audio transcription (WhisperX)
│   │   ├── summarize.py    # Conversation summarization
│   │   ├── ocr_summary.py  # OCR and document processing
│   │   ├── overall_report.py # Report generation
│   │   ├── medical_rag.py  # RAG search over patient medical history
│   │   ├── gmail_integration.py    # Gmail API integration
│   │   └── calendar_integration.py # Google Calendar API integration
│   ├── uploads/            # Uploaded files storage
│   ├── main.py            # FastAPI application
│   └── requirements.txt
│
└── ai-pipeline/            # Google ADK multi-agent system
    ├── conversation_summarizer_agent/  # Conversation processing
    ├── lab_report_agent/               # Lab report analysis
    │   └── subagents/                  # Lab report sub-agents
    ├── prescription_agent/              # Prescription analysis
    ├── report_agent/                   # Comprehensive report generation
    │   └── subagents/                  # Report generation sub-agents
    │       ├── TimelineBuilder/        # Step 1: Timeline construction
    │       ├── ClinicalTrendAnalyser/  # Step 2: Trend analysis
    │       ├── RiskScoringandSeverity/ # Step 3: Risk scoring
    │       ├── DiseaseInference/       # Step 4: Disease inference
    │       ├── MedicationAggregator/   # Step 5: Medication tracking
    │       ├── PatientReportGenerator/ # Step 6: Report generation
    │       └── ReportAggregator/       # Step 7: Final aggregation
    ├── adk-venv/           # ADK virtual environment
    └── requirements.txt
```

---

## 🔌 API Endpoints

### Check-ins
- `POST /upload-checkin` - Upload check-in audio recording
- `GET /api/checkins` - Get all check-ins
- `GET /api/checkins/{id}` - Get check-in by ID

### Prescriptions
- `POST /upload-prescription` - Upload prescription image
- `GET /api/prescriptions` - Get all prescriptions
- `GET /api/prescriptions/{id}` - Get prescription by ID

### Lab Reports
- `POST /upload-lab-report` - Upload lab report image
- `GET /api/reports` - Get all lab reports
- `GET /api/reports/{id}` - Get lab report by ID

### Overall Reports
- `POST /generate-overall-report` - Generate comprehensive health report
- `GET /latest-overall-report` - Get most recent overall report

### Insurance
- `POST /upload-insurance-consultation` - Upload insurance consultation audio
- `GET /api/insurances` - Get all insurance plans
- `GET /api/insurances/{id}` - Get insurance plan by ID

### Hospitals
- `GET /api/hospitals` - Get all hospitals
- `GET /api/hospitals/{id}` - Get hospital by ID
- `POST /api/hospitals` - Create hospital entry

### Appointments & Doctor Escalation
- `GET /appointments/get-patient-context` - Full patient medical context for the calling agent
- `POST /appointments/get-medical-history` - RAG search over patient medical history
- `POST /appointments/send-email` - Email the latest report PDF to a doctor
- `POST /appointments/create-calendar-event` - Create a Google Calendar event for the appointment

### Medical Search
- `POST /medical-search` - General medical Q&A via Gemini
- `POST /user-history-search` - RAG search over the patient's own uploaded history

### File Serving
- `GET /uploads/{file_path}` - Serve uploaded files (PDFs, images, audio)

---

## 🎯 Features

### 1. Weekly Health Check-ins
- Natural, conversational check-ins via Gemini Live API
- Multilingual support (English, Hindi)
- Symptom tracking and mood monitoring
- AI-powered insights and recommendations

### 2. Document Processing
- **Lab Reports**: OCR extraction, abnormal parameter detection, risk scoring
- **Prescriptions**: Medication extraction, adherence tracking, interaction warnings

### 3. Comprehensive Health Reports
- Chronological timeline of all health events
- Trend analysis across lab reports
- Risk scoring and severity assessment
- Disease inference and medication overview
- Patient-friendly summaries and doctor-ready reports

### 4. Doctor Appointments
- AI agent that calls hospitals to book appointments
- Automatic email summaries sent to doctors
- Full medical context provided before consultation

### 5. Insurance Guidance
- Personalized insurance plan recommendations
- RAG-based matching using health profile
- Natural language consultation via Gemini Live

---

## 🔐 Security & Privacy

- All health data is stored securely in PostgreSQL
- File uploads are stored locally (can be configured for cloud storage)
- API keys should be kept in environment variables (never commit to git)
- CORS configured for development (should be restricted in production)
- User consent and data privacy should be implemented before production use

---

**PraanLink** — Bringing continuous preventive healthcare to everyone, not just those with access to expensive systems.
