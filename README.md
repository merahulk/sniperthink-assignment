# SniperThink — Full Stack Hiring Assignment

> Precision Strategy Platform — Interactive frontend + distributed file processing backend.

---

## Project Structure

```
sniperthink/
├── frontend/          # React app (Part 1)
│   └── src/
│       ├── components/
│       │   ├── StrategyFlow.jsx      # Main scroll section orchestrator
│       │   ├── StrategyStep.jsx      # Individual step with animations
│       │   ├── ProgressIndicator.jsx # Sticky scroll-linked side nav
│       │   ├── InterestModal.jsx     # Interest form modal
│       │   └── FileProcessor.jsx    # Part 2 file upload UI
│       ├── hooks/
│       │   └── useScroll.js         # useInView, useScrollProgress hooks
│       ├── data/
│       │   └── strategySteps.js     # Structured step data source
│       ├── api/
│       │   └── index.js             # API utility functions
│       └── styles.css               # All styles (tactical dark aesthetic)
│
└── backend/           # Node.js + Express API (Part 1 + Part 2)
    ├── server.js          # Express app entry point
    ├── db.js              # SQLite setup + promisified helpers
    ├── routes/
    │   ├── interest.js    # POST /api/interest
    │   └── files.js       # POST /api/files/upload, GET status/result
    └── workers/
        └── fileProcessor.js  # Text extraction + analysis logic
```

---

## Quick Start

### Backend

```bash
cd backend
npm install
mkdir uploads
node server.js
# API available at http://localhost:3001
```

### Frontend

```bash
cd frontend
npm install
npm start
# App available at http://localhost:3000
```

---

## API Reference

### Part 1 — Interest

#### `POST /api/interest`
Submit user interest for a strategy step.

**Request body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@company.com",
  "selectedStep": "Pinpoint the Target"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Thanks Jane! We'll be in touch about \"Pinpoint the Target\"."
}
```

---

### Part 2 — File Processing

#### `POST /api/files/upload`
Upload a PDF or TXT file (max 10MB). Returns `jobId` immediately; processing is async.

```
Content-Type: multipart/form-data
field: file
```

**Response:**
```json
{
  "success": true,
  "jobId": "uuid-here",
  "message": "File uploaded. Processing started.",
  "filename": "report.pdf"
}
```

#### `GET /api/files/status/:jobId`
Poll job status.

**Response:**
```json
{
  "jobId": "12345",
  "status": "processing",
  "progress": 60
}
```

**Job states:** `pending` → `processing` → `completed` | `failed`

#### `GET /api/files/result/:jobId`
Retrieve completed processing results.

**Response:**
```json
{
  "success": true,
  "jobId": "...",
  "filename": "report.txt",
  "result": {
    "wordCount": 1234,
    "paragraphCount": 12,
    "topKeywords": [
      { "word": "strategy", "count": 18 },
      { "word": "market", "count": 14 }
    ]
  }
}
```

#### `GET /api/files`
List all jobs (admin overview).

---

## Architecture Notes

### Frontend (Part 1)

**Animation strategy:** Each of the four steps uses a distinct entrance animation class (`anim-slide-up`, `anim-slide-left`, `anim-scale-in`, `anim-rotate-in`) toggled by an `IntersectionObserver` in the `useInView` hook. The scroll progress bar at the top responds to scroll via `useScrollProgress` (reads `getBoundingClientRect` on scroll events, passive listener for performance). The side `ProgressIndicator` also drives from `scrollProgress`. Hover interactions on the detail box use React state, and the metric card uses CSS transitions on `:hover`.

**State management:** Local React state only — no external store needed for this scope. `useState` per component, lifted to `StrategyFlow` for the modal. Each step manages its own `hovered` state.

**Data rendering:** `strategySteps.js` is the single source of truth. Steps are `.map()`-ed — no hardcoded JSX content. Adding a 5th step requires only a data entry.

**API handling:** `api/index.js` wraps `fetch` with proper error propagation. The modal shows loading spinner, success state, and error message based on a `status` string state machine (`idle → loading → success | error`).

### Backend (Part 2)

**Queue:** A lightweight in-memory array queue with an async runner function. Suitable for demo/single-process. For production, replace with Bull/BullMQ + Redis.

**Processing:** `workers/fileProcessor.js` exports `processJob(jobId)` — reads from DB, extracts text (pdf-parse for PDFs, fs.readFileSync for TXT), analyzes (word count, paragraph count, top 10 keywords with stop-word filter), updates progress at 10/30/60/90/100%.

**Database:** SQLite via `sqlite3` with promisified wrappers. Two tables: `interest_submissions` and `file_jobs`.

---

## Deployment

### Vercel (Frontend)
1. Push `frontend/` to GitHub
2. Import in Vercel, set framework to `Create React App`
3. Set env var: `REACT_APP_API_URL=https://your-backend-url`

### Railway / Render (Backend)
1. Push `backend/` to GitHub
2. Set start command: `node server.js`
3. Ensure `/uploads` directory exists (or use cloud storage for production)

---

## Design Decisions

- **Tactical dark aesthetic** — monochrome base with four distinct accent colors matching each step's identity. Barlow Condensed for high-impact display, Space Mono for data/labels, Barlow for readable body.
- **No UI frameworks** — pure CSS with CSS variables, no Tailwind/MUI/Chakra.
- **No external animation libs** — animations use CSS transitions + `transform` toggled by JS class changes. Performant: no JS animation loop, GPU-composited properties only (`transform`, `opacity`).
- **Progressive enhancement** — content is fully readable without JS; animations are layered on top.
