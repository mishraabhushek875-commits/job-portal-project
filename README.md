# 🚀 JobSpark — AI-Powered Job Portal

> Full-stack job portal with AI recommendations, chatbot, interview prep, DSA tracker, hackathon section, and real-time notifications.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)
![Groq AI](https://img.shields.io/badge/Groq-LLaMA3-orange?style=for-the-badge)
![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-black?style=for-the-badge&logo=socket.io)

---

## 📌 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [AI Features](#-ai-features)
- [Screenshots](#-screenshots)

---

## 🎯 About

JobSpark ek full-stack job portal hai jisme AI-powered features hain. Jobseekers apni search history ke basis par personalized job recommendations paate hain. Ek built-in AI chatbot career guidance deta hai. Interview preparation module Groq AI (LLaMA3) se power hota hai. DSA practice tracker progress save karta hai. Hackathon section companies ke competitions list karta hai aur register karne ki facility deta hai.

---

## ✨ Features

### 👤 Authentication
- Register / Login with JWT
- OTP Email Verification
- Role-based access — `jobseeker` aur `recruiter`
- Password hashing with bcryptjs

### 💼 Jobs
- Job post, update, delete (recruiter)
- Search by keyword, location, jobType
- Job detail page with Apply button
- Cover letter with application

### 🤖 AI Recommendation Engine
- User ki search history track hoti hai
- Skills, location, keyword se jobs score kiye jaate hain
- Dashboard pe personalized "Jobs For You" section
- Scoring formula: Keyword (40%) + Skills (30%) + Location (20%) + Recency (10%)

### 💬 AI Chatbot
- Job search in chat — "React jobs Mumbai mein dikhao"
- Career advice — resume tips, interview tips
- Powered by Google Gemini 2.0 Flash
- Chat history DB mein save hoti hai

### 🎤 Interview Preparation
- Dedicated interview prep chatbot
- Powered by **Groq AI (LLaMA3-8b-8192)** — ultra fast
- DSA, System Design, React/Node.js, HR questions
- Hinglish mein friendly responses
- Chat history persist hoti hai

### 📊 DSA Practice Tracker
- 4 topics: Arrays, Linked Lists, Trees, Dynamic Programming
- Questions solve/unsolve toggle
- Progress DB mein save hota hai — page refresh pe bhi rehta hai
- Progress percentage bar har topic ke liye

### 🏆 Hackathon Section
- Active hackathons list
- Register with one click
- Filter by status: open, upcoming, closed
- Registration DB mein track hota hai

### 🔔 Real-time Notifications
- Socket.io se instant notifications
- DB mein bhi save hoti hain
- Mark as read / Mark all read
- Delete notifications
- Bell icon pe unread count badge

### 📄 Profile Management
- Resume upload — Cloudinary pe
- Profile photo upload
- Edit name, location, LinkedIn
- AI Resume Parser (Python + Gemini)
- Skill strength bars

### 📋 Applications
- Apply with cover letter
- Track application status: pending, reviewed, shortlisted, rejected
- Recruiter status update kare — applicant ko real-time notification
- Withdraw application

---

## 🛠 Tech Stack

### Frontend
| Technology | Use |
|---|---|
| Next.js 14 (App Router) | Frontend framework |
| Tailwind CSS | Styling |
| Redux Toolkit | State management |
| Framer Motion | Animations |
| Socket.io Client | Real-time notifications |
| React Hot Toast | Toast notifications |
| Tabler Icons | Icon library |

### Backend
| Technology | Use |
|---|---|
| Node.js + Express | Server |
| MongoDB + Mongoose | Database |
| JWT | Authentication |
| Socket.io | Real-time events |
| Cloudinary | File storage |
| Nodemailer | Email / OTP |
| bcryptjs | Password hashing |

### AI / ML
| Technology | Use |
|---|---|
| Google Gemini 2.0 Flash | AI Chatbot |
| Groq AI (LLaMA3-8b-8192) | Interview Prep |
| Custom Scoring Algorithm | Job Recommendations |
| Python + pdfplumber | Resume Parser |

---

## 📁 Project Structure

```
JOB_PORTAL/
├── backend/
│   ├── src/
│   │   ├── ai/
│   │   │   ├── chatbot/
│   │   │   │   ├── chatbotController.js
│   │   │   │   └── chatbotService.js      ← Gemini AI
│   │   │   ├── interview/
│   │   │   │   └── interviewService.js    ← Groq AI
│   │   │   └── recommendations/
│   │   │       └── jobRecommender.js      ← Custom scoring
│   │   ├── config/
│   │   │   ├── ai.js                      ← Gemini setup
│   │   │   └── db.js                      ← MongoDB connect
│   │   ├── controllers/
│   │   │   ├── appController.js
│   │   │   ├── authController.js
│   │   │   ├── chatbotController.js
│   │   │   ├── dsaController.js
│   │   │   ├── hackathonController.js
│   │   │   ├── interviewController.js
│   │   │   ├── jobController.js
│   │   │   └── notificationController.js
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js
│   │   │   └── uploadMiddleware.js
│   │   ├── models/
│   │   │   ├── application.js
│   │   │   ├── ChatSession.js
│   │   │   ├── DSAProgress.js
│   │   │   ├── Hackathon.js
│   │   │   ├── InterviewSession.js
│   │   │   ├── job.js
│   │   │   ├── Notification.js
│   │   │   ├── SearchHistory.js
│   │   │   └── user.js
│   │   ├── routes/
│   │   │   ├── aiRoutes.js
│   │   │   ├── applicationRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── dsaRoutes.js
│   │   │   ├── hackathonRoutes.js
│   │   │   ├── jobRoutes.js
│   │   │   └── notificationRoutes.js
│   │   ├── services/
│   │   │   ├── emailServices.js
│   │   │   ├── notificationServices.js
│   │   │   └── uploadServices.js
│   │   └── socket/
│   │       └── socketHandler.js
│   ├── python-parser/
│   │   ├── app.py
│   │   └── resume_parser.py
│   ├── server.js
│   └── .env
│
└── frontend_jobportal/
    └── src/
        ├── app/
        │   ├── (dashboard)/
        │   │   ├── layout.js
        │   │   ├── applications/
        │   │   ├── dsa/
        │   │   ├── hackathon/
        │   │   ├── interview/
        │   │   ├── jobs/
        │   │   │   └── [id]/
        │   │   ├── notifications/
        │   │   └── profile/
        │   ├── home/
        │   ├── login/
        │   └── register/
        ├── components/
        │   ├── ChatBot.jsx
        │   ├── JobCard.jsx
        │   ├── Navbar.jsx
        │   └── Sidebar.jsx
        ├── redux/
        │   ├── store.js
        │   └── slices/
        │       ├── authSlice.js
        │       ├── jobSlice.js
        │       └── themeSlice.js
        ├── services/
        │   └── api.js
        └── socket/
            └── socket.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Python 3.8+ (resume parser ke liye)

### Backend Setup

```bash
# Clone karo
git clone https://github.com/yourusername/jobspark.git
cd jobspark/backend

# Dependencies install karo
npm install

# .env file banao (neeche dekho)
cp .env.example .env

# Server start karo
npm run dev
```

### Python Parser Setup (Optional)

```bash
cd backend/python-parser

# Virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Dependencies
pip install flask pdfplumber google-generativeai python-dotenv

# Start karo
python app.py
```

### Frontend Setup

```bash
cd frontend_jobportal

# Dependencies install karo
npm install

# Development server
npm run dev
```

Frontend: `http://localhost:3000`
Backend: `http://localhost:5001`

---

## 🔐 Environment Variables

### Backend `.env`

```env
# Database
MONGO_URI=your_mongodb_atlas_uri

# Server
PORT=5001

# Auth
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Cloudinary (file upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (OTP ke liye)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password

# AI APIs
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key

# Python Parser
PYTHON_PARSER_URL=http://localhost:5002
```

---

## 📡 API Endpoints

### Auth
```
POST   /api/auth/register          Register
POST   /api/auth/login             Login
GET    /api/auth/me                Profile fetch
PUT    /api/auth/update-profile    Profile update
POST   /api/auth/send-otp          OTP bhejo
POST   /api/auth/verify-otp        OTP verify karo
POST   /api/auth/upload/resume     Resume upload
POST   /api/auth/upload/photo      Photo upload
```

### Jobs
```
GET    /api/jobs                   Saari jobs (search + filter)
GET    /api/jobs/:id               Ek job detail
POST   /api/jobs                   Job create (recruiter)
PUT    /api/jobs/:id               Job update (recruiter)
DELETE /api/jobs/:id               Job delete (recruiter)
GET    /api/jobs/myjobs            Recruiter ki jobs
GET    /api/jobs/ai/recommendations  AI recommendations
```

### Applications
```
POST   /api/applications/:jobId    Apply karo
GET    /api/applications/my        Meri applications
GET    /api/applications/check/:jobId  Already applied?
GET    /api/applications/job/:jobId    Job ke applicants (recruiter)
PUT    /api/applications/:id       Status update (recruiter)
DELETE /api/applications/:id       Withdraw
```

### AI
```
POST   /api/ai/chat                Chatbot message
GET    /api/ai/chat/history        Chat history
POST   /api/ai/interview           Interview prep chat
GET    /api/ai/interview/history   Interview history
DELETE /api/ai/interview/reset     Reset interview session
```

### DSA
```
GET    /api/dsa/progress           Progress fetch
PUT    /api/dsa/toggle             Question toggle
GET    /api/dsa/stats              Stats
```

### Hackathons
```
GET    /api/hackathons             Saare hackathons
GET    /api/hackathons/my          Meri registrations
POST   /api/hackathons/:id/register  Register karo
POST   /api/hackathons/seed        Demo data add karo
```

### Notifications
```
GET    /api/notifications          Saari notifications
PUT    /api/notifications/read-all Sab read karo
PUT    /api/notifications/:id/read Ek read karo
DELETE /api/notifications/:id      Delete karo
```

---

## 🤖 AI Features — Deep Dive

### 1. Job Recommendation Engine

Custom content-based filtering algorithm:

```
Score = Keyword Match (40%) 
      + Skills Match (30%) 
      + Location Match (20%) 
      + Recency Boost (10%)
```

- User ki search history `SearchHistory` model mein save hoti hai
- Har job ko score milta hai — top 10 recommend hoti hain
- Dashboard automatically personalize hota hai

### 2. AI Chatbot (Gemini 2.0 Flash)

- Intent detection — job search ya general question?
- Job search → MongoDB query → real listings
- General question → Gemini API → career advice
- Last 10 messages ka context maintain karta hai

### 3. Interview Prep (Groq LLaMA3)

- Ultra-fast responses with LLaMA3-8b-8192
- DSA problems, System Design, React/Node.js
- HR questions aur behavioral prep
- Session history DB mein save hoti hai

### 4. Resume Parser (Python + Gemini)

- PDF upload → pdfplumber se text extract
- Gemini Vision se structured data nikalta hai
- Skills automatically user profile mein save
- Recommendation engine automatically improve hoti hai

---

## 🔌 Real-time Features (Socket.io)

```
Jobseeker apply kare
        ↓
Server: notifyNewApplication()
        ↓
Notification DB mein save
        ↓
Socket event emit — recruiter ke browser mein
        ↓
Toast notification instantly dikhti hai

Recruiter status change kare
        ↓
Server: notifyStatusChange()
        ↓
Jobseeker ke browser mein real-time update
```

---

## 👨‍💻 Developer

**Abhishek Mishra**
IT Intern — Sunnovative Energy Systems Pvt. Ltd.

- Full-stack developer — React, Next.js, Node.js, MongoDB
- AI/ML integration specialist
- Built complete job portal with AI features as learning project

---

## 📄 License

MIT License — free to use and modify.

---

> ⭐ Agar yeh project helpful laga toh star karo!