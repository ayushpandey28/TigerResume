# 🐯 TigerResume

### AI-Powered Resume Intelligence & Career Optimization Platform

TigerResume is a full-stack platform for uploading, analyzing, optimizing, editing, and matching resumes — while always preserving the original uploaded document. It brings together resume parsing, ATS analysis, AI-powered optimization, job matching, skill-gap analysis, GitHub/LinkedIn insights, editable document models, resume templates, and multi-page PDF generation in one place.

---

## 🌐 Live Application

- **Frontend:** https://tiger-resume.vercel.app
- **Backend API:** https://tiger-resume-backend.vercel.app
- **API Health:** https://tiger-resume-backend.vercel.app/api/health

---

## ✨ Key Features

### 🔐 Authentication
- Secure registration and login
- JWT-based authentication with password hashing
- Protected API routes
- User profile and dashboard

### 📄 Resume Management
- Upload PDF resumes and preserve the original document
- Generic resume parsing and normalization
- Resume history and versioning
- Original document viewer and download
- Editable resume document model

### 🤖 AI-Powered Resume Intelligence
- Resume analysis and improvement recommendations
- AI-powered resume optimization
- Job description analysis and resume-to-job matching
- AI resume chat and AI-generated job descriptions
- GitHub and LinkedIn profile analysis

### 📊 ATS Analysis
- ATS score calculation and keyword analysis
- Skill matching and formatting analysis
- Job-specific ATS analysis with history

### 🎯 Skill Gap Analysis
- Required/preferred skill matching and missing-skill detection
- Skill coverage score with priority classification
- Personalized learning roadmap

### 💼 Job Matching
- Job description parsing
- Match percentage, strength analysis, and skill-gap identification

### 🐙 GitHub & 💼 LinkedIn Analysis
- Repository insights and contribution metrics
- Technical improvement suggestions
- Profile completeness, headline, and summary enhancement

### 🎨 Resume Templates
Classic, Modern, and Creative — all supporting multiple pages, long content, missing or custom sections, achievements, and dynamic page breaks.

### 📑 PDF Generation
- Multi-page PDF generation with dynamic page-break handling
- Long experience/project and custom section support
- PDFKit font compatibility, production-ready on Vercel

### 🌓 Theme & 📱 Responsive Design
- Light/dark mode, theme-aware and print-safe UI
- Fully responsive across mobile, tablet, and desktop
- Responsive navbar, mobile sidebar drawer, and forms

### 🖨️ Print Support
- Clean browser printing with navbar/sidebar/controls hidden
- Multi-page, dark-mode-safe printing

---

## 🏗️ Architecture

TigerResume keeps the original uploaded document separate from every derived representation:

```
ORIGINAL DOCUMENT → DOCUMENT MODEL → SEMANTIC RESUME DATA
                                          │
                        ┌─────────────────┼──────────────────┐
                        ▼                 ▼                  ▼
                       ATS               AI            RESUME EDITOR
                        │                 │                  │
                        ▼                 ▼                  ▼
                    Analytics       Optimization      Document Updates
                                          │
                                          ▼
                                     TEMPLATES
                                          │
                                          ▼
                                  MULTI-PAGE PDF
```

**Core principle:** Original Document ≠ Document Model ≠ Semantic Model ≠ Template Model. The original uploaded file is the source of truth and is never destroyed by parsing, normalization, editing, or template generation.

### 🧠 AI Architecture

TigerResume uses Google Gemini with automatic multi-model failover:

```
AI Request → Primary Gemini Model
                 │
        ┌────────┴────────┐
     Success        Model-specific failure
        │                 │
        ▼                 ▼
    Response       Next Gemini Model → (repeats until success or all models exhausted)
```

The system only switches models on model-specific availability issues (unavailable, unsupported, deprecated) — it doesn't switch models for application-level failures like invalid credentials or malformed requests.

---

## 🛠️ Technology Stack

| Layer | Stack |
|---|---|
| **Frontend** | Next.js, React, JavaScript, CSS |
| **Backend** | Node.js, Express.js, Mongoose, JWT, bcrypt, Multer, PDFKit |
| **Database** | MongoDB Atlas |
| **AI** | Google Gemini API (`@google/generative-ai`) |
| **File Storage** | Cloudinary |
| **Deployment** | Vercel, GitHub |

---

## 📁 Project Structure

```
TigerResume/
├── backend/
│   ├── api/
│   │   └── index.js
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validators/
│   ├── test_suite.js
│   ├── test_universal_pipeline.js
│   ├── test_layout_engine.js
│   ├── test_serverless_db.js
│   ├── test_gemini_failover.js
│   ├── test_pdf_production_fonts.js
│   ├── test_real_gemini.js
│   ├── server.js
│   ├── package.json
│   └── vercel.json
├── frontend/
│   ├── app/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── lib/
│   ├── public/
│   └── package.json
└── README.md
```

---

## ⚙️ Environment Variables

### Backend — `backend/.env`

```env
NODE_ENV=development
PORT=5000

MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret

GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-3.5-flash-lite

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

FRONTEND_URL=http://localhost:3000
```

### Frontend — `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Production

```env
# Frontend
NEXT_PUBLIC_API_URL=https://tiger-resume-backend.vercel.app/api

# Backend
FRONTEND_URL=https://tiger-resume.vercel.app
```

> Never commit real credentials, API keys, database URIs, JWT secrets, or Cloudinary secrets to GitHub.

---

## 💻 Local Development

```bash
# 1. Clone the repository
git clone https://github.com/ayushpandey28/TigerResume.git
cd TigerResume

# 2. Backend setup
cd backend
npm install
# add your .env file here
npm run dev          # runs on http://localhost:5000

# 3. Frontend setup (new terminal)
cd frontend
npm install
# add your .env.local file here
npm run dev          # runs on http://localhost:3000
```

---

## 🧪 Testing

**Backend**

```bash
cd backend
npm test
```

Covers resume processing, the universal resume pipeline, the layout-aware document engine, Gemini model failover, PDFKit production fonts, and MongoDB serverless behavior. Individual suites can also be run directly:

```bash
node test_suite.js
node test_universal_pipeline.js
node test_layout_engine.js
node test_gemini_failover.js
node test_pdf_production_fonts.js
node test_serverless_db.js
```

**Frontend**

```bash
cd frontend
npm run build
```

---

## ✅ Verified Areas

Authentication · MongoDB connection handling · Serverless cold starts & reconnection · Resume parsing (generic structures, custom sections) · Document model processing · Multi-column & multi-page documents · PDF generation (Classic, Modern, Creative templates) · PDFKit standard fonts · Gemini model failover · AI response parsing · Responsive navigation · Frontend production build

---

## ☁️ Production Deployment

Frontend and backend are deployed as separate Vercel applications, backed by MongoDB Atlas, Google Gemini, and Cloudinary. Production uploads use Cloudinary rather than the Vercel function filesystem, since that filesystem isn't reliably writable in serverless environments.

---

## 🔒 Security

- JWT authentication with secure password hashing
- Protected routes, CORS validation, and rate limiting
- Environment-based secrets, never hardcoded
- File type and size validation, user ownership checks
- Controlled API error responses and safe AI key handling

Keep these server-side only: `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `CLOUDINARY_API_SECRET`

---

## 📊 Current Status: Production Ready

Authentication, resume upload & parsing, the resume editor, ATS analysis, AI analysis & optimization, job matching, skill-gap analysis and roadmap, GitHub/LinkedIn analysis, all three templates, multi-page PDF export, Gemini failover, MongoDB serverless handling, responsive UI, dark/light mode, and print support are all live and working.

---

## ⚠️ Known Limitations

**LinkedIn** — Scraping arbitrary LinkedIn profiles is limited by LinkedIn's anti-scraping restrictions, so some workflows need user-provided profile info or an authorized API.

**AI Quotas** — Model failover switches between Gemini models, but it can't work around an account-wide quota, billing, or credential issue. If the whole Gemini account is unavailable, AI features fail gracefully rather than silently.

---

## 🔮 Future Improvements

DOCX export · additional templates · job application tracking · advanced analytics · more AI providers · OAuth · custom domains · improved resume scoring · collaboration features · alternative cloud storage

---

## 👨‍💻 Author

**Ayush Pandey**
GitHub: https://github.com/ayushpandey28
Portfolio: https://ayush-portfolio-lyart-eight.vercel.app/

---

## 🤝 Contributing

```bash
git checkout -b feature/your-feature
git add .
git commit -m "feat: describe your change"
git push origin feature/your-feature
```

Then open a pull request.

---

## ⭐ Support

If you find TigerResume useful, consider starring the repo on GitHub.
