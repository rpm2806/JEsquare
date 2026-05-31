# AI-Powered JEE Test Generation SaaS

A scalable, production-ready platform for generating JEE examination papers, conducting Computer-Based Tests (CBT), managing question banks, and providing analytics — built for coaching institutes and individual teachers.

## 🏗️ Architecture

```
┌─────────────────────┐     ┌──────────────────────┐
│   Next.js Frontend  │────▶│   NestJS Backend API  │
│   (Port 3000)       │     │   (Port 4000)         │
└─────────────────────┘     └──────────┬───────────┘
                                       │
                            ┌──────────▼───────────┐
                            │   SQLite / PostgreSQL │
                            │   (Prisma ORM)        │
                            └──────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+

### Setup

1. **Clone and install dependencies:**
```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed

# Frontend
cd ../frontend
npm install
```

2. **Configure environment:**
```bash
# Backend .env is pre-configured for local development
# Frontend .env.local is pre-configured for local development
```

3. **Start development servers:**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

4. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api
- Swagger Docs: http://localhost:4000/api/docs

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, TailwindCSS |
| Backend | NestJS, TypeScript |
| Database | SQLite (dev) / PostgreSQL (prod), Prisma ORM |
| Auth | JWT + Refresh Tokens, bcrypt |
| State | Zustand |
| Charts | Recharts |
| LaTeX | KaTeX |
| Icons | Lucide React |

## 🎯 Features

### Phase 1 — Authentication & RBAC
- JWT authentication with refresh tokens
- Role-based access: Super Admin, Institute Admin, Teacher, Student
- Session management and audit logging

### Phase 2 — Question Bank
- MCQ, Numerical, Multi-correct question types
- LaTeX support for mathematical expressions
- Subject/Chapter/Topic tagging
- Difficulty levels (Easy, Medium, Hard)
- Search, filter, and pagination
- Admin moderation workflow

### Phase 3 — Dynamic Test Generation
- Chapter-wise, subject-wise, and full syllabus tests
- Configurable difficulty distribution
- Anti-repetition algorithm
- Custom sections with different marking schemes

### Phase 4 — PDF Generation
- Professional question papers with institute branding
- Answer keys and solution documents
- QR code verification
- LaTeX rendering in PDFs

### Phase 5 — CBT Examination System
- NTA-style Computer-Based Test interface
- Real-time timer with auto-submit
- Question palette with status tracking
- Mark for review, save & next navigation
- Anti-cheating (tab switch, copy-paste detection)
- Autosave answers

### Phase 6 — Analytics Engine
- Score progression charts
- Subject-wise accuracy analysis
- Weak chapter identification
- Percentile and ranking system
- Time analysis per question

### Phase 7 — Institute SaaS
- Multi-tenant institute management
- Teacher and batch management
- Subscription plans (Free/Basic/Pro/Institute)
- White-label branding

### Phase 8 — AI Question Extraction
- Extract questions from PDF/images using OCR
- Auto-detect question type and difficulty
- Review and edit before saving

### Phase 9 — Doubt Marketplace
- Student doubt submission (text + image)
- AI-powered initial responses
- Human solver marketplace
- Rating and feedback system

### Phase 10 — Production & DevOps
- Docker containerization
- Redis caching
- Database indexing
- Request logging and monitoring

## 📁 Project Structure

```
Open-Book/
├── backend/          # NestJS API server
│   ├── src/
│   │   ├── modules/  # Feature modules
│   │   ├── common/   # Shared utilities
│   │   └── prisma/   # Database service
│   └── prisma/       # Schema & migrations
├── frontend/         # Next.js web app
│   └── src/
│       ├── app/      # App Router pages
│       ├── components/ # UI components
│       ├── lib/      # Utilities
│       ├── store/    # State management
│       └── types/    # TypeScript types
└── docker-compose.yml
```

## 💰 Revenue Model

| Plan | Price | Features |
|------|-------|----------|
| Free | ₹0/month | 2 papers/month |
| Basic | ₹199/month | 20 papers/month, basic analytics |
| Pro | ₹999/month | Unlimited papers, full analytics |
| Institute | ₹4999+/month | Multi-user, white-label, priority support |

## 📝 License

Private — All rights reserved.
