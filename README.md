# 🐯 TigerResume

> AI-powered resume optimization and career analysis platform for students and job seekers.

TigerResume is a full-stack web application designed to help users **create, analyze, optimize, and improve their resumes** using AI-powered tools. It combines ATS analysis, job matching, skill-gap analysis, GitHub/LinkedIn analysis, resume versioning, PDF generation, and an AI-powered resume assistant into one platform.

---

## 🚀 Features

### 📄 Resume Management

- Upload and manage resumes
- Resume parsing and text extraction
- Resume editing and preview
- Resume version management
- Generate downloadable PDF resumes
- Multiple professional resume templates
  - Classic
  - Modern
  - Creative

### 🤖 AI Resume Assistant

- Ask questions about your resume
- Get AI-powered resume insights
- Analyze resume strengths and weaknesses
- Receive personalized improvement recommendations
- Improve professional summaries
- Optimize experience and project descriptions

### 🎯 ATS Resume Analysis

- ATS compatibility analysis
- Keyword matching
- Formatting analysis
- ATS score breakdown
- Missing keyword identification
- Resume optimization suggestions

### 💼 Job Description Analysis

- Add and manage job descriptions
- AI-powered job description analysis
- Identify required skills and keywords
- Match resumes against specific job descriptions
- Calculate resume-job compatibility

### 📈 Resume Improvement

- AI-powered resume optimization
- Before/After comparison
- Section-wise improvement suggestions
- Improve professional summaries
- Optimize work experience bullets
- Optimize project descriptions
- Apply selected improvements
- Create new resume versions

### 🧠 Skill Gap Analysis

- Identify skills required for a target job
- Compare existing skills with required skills
- Find missing technical skills
- Generate personalized skill-learning roadmaps

### 🐙 GitHub Analysis

- Analyze GitHub profiles
- Analyze repositories and technical activity
- Generate GitHub insights
- Maintain GitHub analysis history

### 💼 LinkedIn Analysis

- Analyze LinkedIn profile information
- Generate profile improvement suggestions
- Maintain LinkedIn analysis history

### 👤 User Profile & Authentication

- User signup and login
- JWT-based authentication
- Protected API routes
- User profile management
- Secure access to personal resume data

### 📊 Dashboard & History

- Centralized dashboard
- Resume history
- ATS analysis history
- Job matching history
- Skill-gap history
- AI analysis history
- Chat history

---

# 🛠️ Tech Stack

## Frontend

- Next.js
- React.js
- JavaScript
- CSS
- Axios
- React Context API

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- REST APIs

## AI & Processing

- Google Gemini API
- AI-powered resume analysis
- AI-powered resume optimization
- AI job description analysis
- AI resume chat
- PDF text extraction
- PDF generation

## Developer Tools

- Git
- GitHub
- npm
- Nodemon

---

# 🏗️ Project Architecture

```text
TigerResume
│
├── backend
│   │
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middlewares
│   │   ├── models
│   │   ├── routes
│   │   ├── services
│   │   │   ├── ai
│   │   │   ├── ats
│   │   │   ├── chat
│   │   │   ├── job
│   │   │   ├── profile
│   │   │   └── resume
│   │   ├── utils
│   │   └── validators
│   │
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend
│   │
│   ├── app
│   ├── components
│   ├── context
│   ├── hooks
│   ├── lib
│   ├── public
│   ├── package.json
│   └── .env.example
│
├── .gitignore
├── package.json
└── README.md
```

---

# 🔄 Application Workflow

```text
                    ┌───────────────────┐
                    │       User        │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ TigerResume       │
                    │ Frontend          │
                    │ Next.js + React   │
                    └─────────┬─────────┘
                              │
                         REST APIs
                              │
                              ▼
                    ┌───────────────────┐
                    │ Node.js + Express │
                    │ Backend           │
                    └──────┬─────┬──────┘
                           │     │
                ┌──────────┘     └──────────┐
                ▼                           ▼
       ┌─────────────────┐        ┌─────────────────┐
       │ MongoDB Atlas   │        │ Google Gemini   │
       │ Database        │        │ AI API          │
       └─────────────────┘        └─────────────────┘
```

---

# 📌 Core Modules

| Module | Description |
|---|---|
| Resume Management | Upload, edit, analyze and manage resumes |
| ATS Analyzer | Analyze ATS compatibility and keywords |
| Job Matching | Match resumes with job descriptions |
| AI Optimizer | Improve resume content using AI |
| Skill Gap | Identify missing skills and learning requirements |
| AI Chat | Ask questions about resume and career |
| GitHub Analysis | Analyze GitHub profile and activity |
| LinkedIn Analysis | Analyze LinkedIn profile |
| PDF Generator | Generate professional PDF resumes |
| Dashboard | Centralized resume and career analytics |
| Authentication | Secure user authentication and authorization |

---

# ⚙️ Installation & Setup

## 1. Clone the Repository

```bash
git clone https://github.com/ayushpandey28/TigerResume.git
cd TigerResume
```

---

## 2. Backend Setup

Go to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```text
backend/.env
```

Example:

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

GEMINI_API_KEY=your_gemini_api_key

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

FRONTEND_URL=http://localhost:3000

NODE_ENV=development
```

> Never commit `.env` files or API keys to GitHub.

Start the backend:

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

---

# 💻 Frontend Setup

Open another terminal and go to:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create:

```text
frontend/.env.local
```

Add:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Frontend:

```text
http://localhost:3000
```

---

# 🔐 Authentication

TigerResume uses **JWT-based authentication**.

Authentication flow:

```text
Signup
  ↓
User Account
  ↓
JWT Token
  ↓
Authenticated API Requests
  ↓
Protected Resources
```

Protected features include:

- Resume management
- ATS analysis
- Job matching
- AI analysis
- Chat history
- Skill-gap analysis
- Profile analysis
- Dashboard data

---

# 🗄️ Database

TigerResume uses **MongoDB Atlas** for persistent data storage.

The application manages data related to:

```text
Users
Resumes
Resume Versions
Job Descriptions
ATS Results
Job Matches
Skill Gaps
Analysis History
Chat History
Subscriptions
Payments
Files
```

---

# 🤖 AI Integration

TigerResume integrates Google's Gemini API to provide AI-powered functionality.

AI capabilities include:

- Resume analysis
- Resume optimization
- Professional summary improvement
- Experience bullet optimization
- Project description optimization
- Job description analysis
- Skill-gap analysis
- AI resume chat
- Career-oriented recommendations

---

# 📄 Resume Templates

TigerResume currently provides three resume templates.

### Classic

A clean and traditional resume layout suitable for professional and ATS-focused applications.

### Modern

A modern professional design with structured sections and visual hierarchy.

### Creative

A visually distinctive design for users who want a more creative resume presentation.

---

# 📊 Example User Workflow

```text
Upload Resume
      ↓
Analyze ATS Score
      ↓
Add Target Job Description
      ↓
Match Resume With Job
      ↓
Identify Missing Skills & Keywords
      ↓
Run AI Resume Optimization
      ↓
Review Before / After Changes
      ↓
Apply Selected Improvements
      ↓
Create New Resume Version
      ↓
Download Optimized Resume
```

---

# 🔒 Security

TigerResume follows several security practices:

- JWT authentication
- Protected API routes
- Environment-based secrets
- Input validation
- Error handling middleware
- Rate limiting
- `.env` protection through `.gitignore`

> API keys, database credentials, JWT secrets and other sensitive environment variables should never be committed to the repository.

---

# 📁 Environment Variables

Environment files are intentionally excluded from version control.

Example files are provided:

```text
backend/.env.example
frontend/.env.example
```

Create your local environment files using these examples.

---

# 🚀 Deployment

TigerResume is designed to support a modern cloud deployment architecture.

### Frontend

Vercel

### Backend

Render

### Database

MongoDB Atlas

### AI

Google Gemini API

Recommended production architecture:

```text
                    ┌───────────────┐
                    │    Vercel     │
                    │   Frontend    │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │    Render     │
                    │    Backend    │
                    └───────┬───────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
      ┌───────────────┐          ┌────────────────┐
      │ MongoDB Atlas │          │  Gemini AI API │
      └───────────────┘          └────────────────┘
```

---

# 🎯 Project Objective

The main objective of TigerResume is to simplify the resume-building and job-application process by bringing multiple career tools into a single platform.

Instead of using separate tools for resume creation, ATS checking, job matching, skill analysis, and resume optimization, TigerResume provides an integrated workflow.

---

# 🔮 Future Improvements

Potential future improvements include:

- More professional resume templates
- Advanced analytics dashboard
- Job portal integrations
- Automated job recommendations
- LinkedIn profile synchronization
- Cloud-based file storage
- Advanced AI career recommendations
- Improved resume scoring
- Automated application tracking
- Real-time collaborative resume editing

---

# 👨‍💻 Author

## Ayush Pandey

**B.Tech Computer Science & Engineering**
** KIET Group of Institutions , Ghaziabad **

GitHub:  
https://github.com/ayushpandey28

---

# ⭐ Support

If you find TigerResume useful, consider giving the repository a ⭐ on GitHub.

---

# 📜 License

This project is developed for educational, learning, and portfolio purposes.
