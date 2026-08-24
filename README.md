# TigerResume

**AI-powered Resume & Job Optimization Platform**

TigerResume helps job seekers analyze, optimize, and improve their resumes for specific job descriptions using AI-powered analysis and ATS-style scoring.

---

## Features

- **Resume Upload & Parsing** — Upload PDF resumes and extract structured data
- **ATS-Style Scoring** — Get an ATS compatibility score with detailed breakdown
- **Job Description Analysis** — Paste a JD and extract key requirements
- **Job Matching** — Compare your resume against a job description
- **Skill Gap Analysis** — Identify missing skills and get a learning roadmap
- **AI Resume Optimization** — Get AI-powered suggestions to improve your resume
- **Before/After Comparison** — See score improvements after optimization
- **AI Resume Chat** — Ask questions about your resume and job fit
- **GitHub Analysis** — Analyze your GitHub profile for portfolio insights
- **LinkedIn Analysis** — Get suggestions to improve your LinkedIn profile
- **Resume Templates** — Classic, Modern, and Creative templates
- **History** — Track all your analyses and optimizations

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Next.js (App Router), JavaScript |
| Backend | Node.js, Express.js, JavaScript |
| Database | MongoDB, Mongoose |
| AI | Google Gemini API (replaceable AI layer) |
| File Storage | Cloudinary |
| Auth | JWT, bcryptjs |
| PDF | pdf-parse, jsPDF |

---

## Architecture

```
Frontend (Next.js)
    ↓
Backend (Express.js)
    ↓
┌─────────────┬──────────────┬─────────────┐
│  MongoDB    │  AI Service  │  Cloudinary  │
│  (Data)     │  (Gemini)    │  (Files)     │
└─────────────┴──────────────┴─────────────┘
```

### AI Architecture

```
aiService.js (abstraction layer)
    ↓
geminiService.js (Gemini-specific)
    ↓
Structured JSON responses
    ↓
Validation before frontend
```

The AI layer is designed to be replaceable. The application works without Gemini for core features (upload, parsing, basic ATS scoring, templates, history).

---

## Folder Structure

```
TigerResume/
├── frontend/tiger-resume/    # Next.js app
│   ├── app/                  # App Router pages
│   ├── components/           # React components
│   ├── lib/                  # Utilities
│   ├── context/              # React context providers
│   └── hooks/                # Custom hooks
│
└── backend/                  # Express.js API
    └── src/
        ├── config/           # DB, Gemini, Cloudinary config
        ├── controllers/      # Route handlers
        ├── services/         # Business logic
        ├── models/           # Mongoose models
        ├── routes/           # API routes
        ├── middlewares/      # Auth, upload, error handling
        ├── validators/       # Input validation
        └── utils/            # Helpers (JWT, logger, response)
```

---

## Installation

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Google Gemini API key (optional — core features work without it)
- Cloudinary account (optional — for cloud file storage)

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd TigerResume

# Install all dependencies
npm run install:all
```

### Environment Variables

#### Backend (`backend/.env`)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tigerresume
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your-gemini-api-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

#### Frontend (`frontend/tiger-resume/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Running the Project

```bash
# Run both frontend and backend
npm run dev

# Or run separately
npm run dev:backend    # Backend on port 5000
npm run dev:frontend   # Frontend on port 3000
```

---

## API Overview

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Health check |
| `/api/auth` | Authentication (signup, login) |
| `/api/resume` | Resume CRUD operations |
| `/api/ats` | ATS scoring |
| `/api/jobs` | Job description management |
| `/api/job-match` | Resume-JD matching |
| `/api/improvement` | Resume optimization |
| `/api/skills` | Skill gap analysis |
| `/api/github` | GitHub profile analysis |
| `/api/linkedin` | LinkedIn analysis |
| `/api/chat` | AI resume chat |
| `/api/history` | Analysis history |

---

## ATS Scoring Approach

The ATS-style score is a **compatibility estimate**, not an actual ATS system score.

It evaluates:
- Keyword match against job description
- Skills alignment
- Job relevance of experience and projects
- Resume structure and formatting
- Section completeness

> **Note:** This is an ATS-style compatibility score for guidance purposes. It does not represent the exact scoring used by any specific ATS system.

---

## Gemini Integration

Gemini powers advanced features:
- Deep resume analysis
- Semantic job matching
- AI-powered optimization suggestions
- Resume chat

If the Gemini API key is not configured:
- Core features (upload, parsing, basic ATS, templates) continue to work
- AI features show an "AI unavailable" message
- No crashes or broken UI

---

## Screenshots

*Screenshots will be added as features are implemented.*

---

## Future Improvements

- Multiple AI provider support (OpenAI, Claude)
- Cover letter generation
- Interview preparation
- Resume collaboration
- Bulk job matching
- Browser extension for job boards
- Mobile-responsive PWA

---

## License

MIT
