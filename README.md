# 💎 FinFlow — Full-Stack MERN Personal Finance & Wealth Platform

<div align="center">

![FinFlow Banner](https://img.shields.io/badge/FinFlow-Finance%20Platform-9A384F?style=for-the-badge&logo=cashapp&logoColor=white)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas%20Cloud-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**An enterprise-grade, luxury-aesthetic personal finance, budget tracking, and wealth architecture platform.**

[Features](#-key-features) • [Tech Stack](#-languages--tools-used) • [Architecture](#-system-architecture) • [Getting Started](#-step-by-step-setup-guide) • [API Reference](#-api-endpoints-reference) • [Security](#-security--privacy-architecture)

</div>

---

### 🌐 Live Production Deployment
- **Official Live Website:** **[https://fineflow-finance.onrender.com/](https://fineflow-finance.onrender.com/)**
- **Hosting Environment:** Render Cloud Platform
- **Database:** MongoDB Atlas (Multi-Shard Replica Set)

---

### 🎓 Final Year Project — Kalasalingam Academy of Research and Education
- **Department:** Computer Science & Engineering (Artificial Intelligence & Machine Learning)
- **Team Name:** Team Avengers
- **Presentation Decks:**
  - 📊 **[Download Project Presentation (.pptx)](docs/presentation/FinFlow_Project_Presentation.pptx)**
  - 🖥️ **[Download Final Year Defense Deck 16:9 Widescreen (.pptx)](docs/presentation/FinFlow_Final_Year_Presentation.pptx)**

| Team Member | Registration Number | Project Responsibility |
|---|---|---|
| **P. Nithees Kumar** | `99230041158` | Frontend & Dashboard Development |
| **E. Sujay** | `99230041188` | Backend API & Controller Architecture |
| **Trishav Supolia** | `99230041203` | Database Models & Data Validation |
| **Sujitha Mary P** | `99230041132` | Authentication & OTP Security Integration |
| **Jelci Antoniya A** | `99230041114` | Quality Assurance, Testing & Documentation |

---

### 📸 Application Interface & Website Screenshots

<div align="center">

#### 1. Executive Dashboard & Real-Time Net Worth Overview
*Displays real-time aggregated net worth (₹1,54,000.00), monthly inflow/outflow metrics, volumetric cash velocity, and outflow breakdown.*
<br/>
<img src="docs/screenshots/02_dashboard_overview.jpg" alt="FinFlow Executive Dashboard Overview" width="95%" />

<br/><br/>

#### 2. Live Frosted Ledger & Quick Transaction Log
*Real-time synchronized transactions alongside the Express Glass Log instant expense capture interface.*
<br/>
<img src="docs/screenshots/03_frosted_ledger_quick_log.jpg" alt="Live Frosted Ledger & Express Glass Log" width="95%" />

<br/><br/>

#### 3. Financial Ledger, Auditing & CSV Export
*Full audit trail with categorization, search, filtering by type/category, and one-click CSV ledger export.*
<br/>
<img src="docs/screenshots/04_transactions_ledger.jpg" alt="Financial Ledger & Transactions Table" width="95%" />

<br/><br/>

#### 4. Financial Analytics, Cash Velocity & Savings Trend
*Deep behavioral insights, savings consistency, capital accumulation curve, and daily savings velocity cycle.*
<br/>
<img src="docs/screenshots/05_analytics_velocity.jpg" alt="Financial Analytics & Velocity" width="95%" />

<br/><br/>

#### 5. User Registration & Password Strength Validation
*Enterprise registration system featuring real-time password strength validation and dual-channel OTP verification.*
<br/>
<img src="docs/screenshots/01_register_account.jpg" alt="FinFlow Registration with Password Strength Indicator" width="60%" />

</div>

---

## 📖 Overview

**FinFlow** is a modern full-stack web application engineered to transform personal financial management. Combining the power of the **MERN** stack (MongoDB, Express, React, Node.js) with high-velocity **Vite** build tooling, FinFlow delivers executive financial clarity through:

- **Real-Time Cash Flow Velocity**: Dynamic monitoring of inflows, outflows, and net burn rates.
- **Envelope Budgeting**: Real-time spending threshold meters with automated visual health alerts.
- **Categorized Transaction Ledger**: Instant filtering, sorting, pagination, and multi-field search.
- **Savings Goals & Vault Tracking**: Visual milestone progress, target dates, and priority indicators.
- **Dual Luxury Theme System**: Built-in dark mode (deep burgundy charcoal) and warm executive light mode.

---

## 🛠️ Languages & Tools Used

### 🌐 Core Languages
| Technology | Badge | Purpose |
|---|---|---|
| **JavaScript (ES6+)** | ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black) | Primary programming language used across both frontend and backend |
| **HTML5** | ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white) | Semantic structure, accessibility, and modern web layout |
| **CSS3** | ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white) | Design tokens, custom CSS properties, gradients, and scrollbars |

### 🎨 Frontend Ecosystem
| Tool / Library | Badge | Role in Project |
|---|---|---|
| **React 18** | ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB) | Declarative component architecture and interactive state flows |
| **Vite** | ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) | Ultra-fast HMR (Hot Module Replacement) and optimized production bundler |
| **Tailwind CSS v3** | ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) | Utility-first responsive styling and theme configuration |
| **Recharts** | ![Recharts](https://img.shields.io/badge/Recharts-22b5bf?style=flat-square&logo=chartdotjs&logoColor=white) | Interactive data visualizations (Cash flow bars, expense donut breakdown) |
| **Framer Motion** | ![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white) | Smooth UI transitions, modal animations, and interactive cards |
| **Lucide Icons** | ![Lucide](https://img.shields.io/badge/Lucide_Icons-F56565?style=flat-square&logo=feather&logoColor=white) | Consistent, modern vector financial and navigation iconography |
| **React Router DOM v7** | ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=flat-square&logo=react-router&logoColor=white) | Client-side routing, route guards (`ProtectedRoute`), and layouts |
| **Axios** | ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white) | Promise-based HTTP client with request/response interceptors |

### ⚙️ Backend & Database
| Tool / Library | Badge | Role in Project |
|---|---|---|
| **Node.js** | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white) | Asynchronous event-driven server runtime environment |
| **Express.js** | ![Express](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white) | RESTful API framework, middleware routing, and request pipelines |
| **MongoDB Atlas** | ![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white) | Cloud NoSQL database cluster for scalable distributed storage |
| **Mongoose** | ![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=flat-square&logo=mongoose&logoColor=white) | Object Data Modeling (ODM) schema definition, validation, and hooks |
| **JWT (jsonwebtoken)** | ![JWT](https://img.shields.io/badge/JWT-black?style=flat-square&logo=JSON%20web%20tokens) | Stateless authentication via signed JSON Web Tokens |
| **Bcrypt.js** | ![Bcrypt](https://img.shields.io/badge/Bcrypt.js-4B8BBE?style=flat-square&logo=letsencrypt&logoColor=white) | Cryptographic password hashing with salted rounds |
| **Helmet** | ![Helmet](https://img.shields.io/badge/Helmet-000000?style=flat-square&logo=shield&logoColor=white) | HTTP security headers protecting against common web exploits |
| **Express Rate Limit** | ![Rate Limit](https://img.shields.io/badge/Rate_Limiter-FF6B6B?style=flat-square&logo=fastapi&logoColor=white) | API rate limiting safeguarding authentication endpoints from brute-force |

### 🛠️ Developer Tooling & DevOps
| Tool | Badge | Role in Project |
|---|---|---|
| **Concurrently** | ![Concurrently](https://img.shields.io/badge/Concurrently-7952B3?style=flat-square&logo=gnubash&logoColor=white) | Orchestrates parallel execution of backend & frontend in 1 terminal |
| **Nodemon** | ![Nodemon](https://img.shields.io/badge/Nodemon-76D04B?style=flat-square&logo=nodemon&logoColor=white) | Automatic server restarts upon backend code changes |
| **PostCSS & Autoprefixer**| ![PostCSS](https://img.shields.io/badge/PostCSS-DD3A0A?style=flat-square&logo=postcss&logoColor=white) | Modern CSS transformation and vendor-prefix generation |
| **Git & GitHub** | ![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white) | Distributed version control and remote collaborative repository |

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Client["Frontend Client (Port 5173)"]
        UI[React 18 Components]
        Router[React Router v7 Protected Routes]
        Context[Auth & Theme Context]
        AxiosClient[Axios API Client + Interceptor]
        UI --> Router
        Router --> Context
        Context --> AxiosClient
    end

    subgraph Server["Backend Server (Port 5000)"]
        Express[Express REST App]
        Security[Helmet, CORS & Rate Limiter]
        AuthMW[JWT Authentication Middleware]
        Controllers[API Controllers]
        Services[Financial Calculations Service]
        Express --> Security
        Security --> AuthMW
        AuthMW --> Controllers
        Controllers --> Services
    end

    subgraph Database["Database Tier"]
        MongooseODM[Mongoose ODM Schemas]
        Atlas[MongoDB Atlas Cloud Cluster]
        Controllers --> MongooseODM
        MongooseODM --> Atlas
    end

    AxiosClient -->|JSON Requests with Bearer JWT| Express
    Express -->|Aggregated Analytics & JSON Data| AxiosClient
```

---

## 🚀 Step-by-Step Setup Guide

Follow this comprehensive guide to install, configure, and launch the platform on any machine:

### 1. Prerequisites
Ensure you have the following installed on your computer:
- **Node.js**: v18.0.0 or higher (`node -v`)
- **npm**: v9.0.0 or higher (`npm -v`)
- **Git**: Installed and configured (`git --version`)

---

### 2. Clone the Repository
```bash
git clone https://github.com/maxtris97/Expense-and-budget-magnagment-platform.git
cd Expense-and-budget-magnagment-platform
```

---

### 3. Install All Dependencies (One-Click)
FinFlow uses a monorepo structure. You can install root, server, and client dependencies in one command:

```bash
npm run install:all
```

*(This runs `npm install` in root, `client/`, and `server/` automatically).*

---

### 4. Configure Environment Variables

Create `.env` files in both `server/` and `client/` directories based on the provided examples:

#### A. Backend Config (`server/.env`)
Create `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.bz03qcs.mongodb.net/finflow?retryWrites=true&w=majority
JWT_SECRET=finflow_super_secret_jwt_key_2026_production_style
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
COOKIE_SECRET=finflow_cookie_signing_secret_98765
```

> **Tip for Local MongoDB:** If running MongoDB locally instead of Atlas, set:
> `MONGODB_URI=mongodb://127.0.0.1:27017/finflow`

#### B. Frontend Config (`client/.env`)
Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

---

### 5. Seed Realistic Demo Data
To populate the database with realistic sample transactions, budget envelopes, and savings goals:

```bash
npm run seed
```

**Demo Account Credentials:**
- **Email:** `rajiv@finflow.io`
- **Password:** `password123`

---

### 6. Start the Development Servers
Run both backend Express server and frontend Vite server concurrently:

```bash
npm run dev
```

Your app will be live and accessible at:
- **Client Web App:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description | Protected |
|---|---|---|---|
| `GET` | `/api/health` | Service health status & database connectivity | No |
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT | No |
| `GET` | `/api/auth/me` | Fetch currently logged-in user profile | Yes |
| `POST` | `/api/auth/logout` | Clear session and cookies | Yes |
| `GET` | `/api/dashboard/summary` | Net worth, monthly cash flow, and velocity | Yes |
| `GET` | `/api/transactions` | Query, filter, and paginate transactions | Yes |
| `POST` | `/api/transactions` | Record a new financial transaction | Yes |
| `PUT` | `/api/transactions/:id` | Update an existing transaction | Yes |
| `DELETE` | `/api/transactions/:id` | Remove a transaction record | Yes |
| `GET` | `/api/budgets` | Fetch active category budgets and spending limits | Yes |
| `POST` | `/api/budgets` | Create or update a category budget envelope | Yes |
| `GET` | `/api/goals` | Fetch all savings targets and current progress | Yes |
| `POST` | `/api/goals` | Add a new savings goal target | Yes |
| `PUT` | `/api/goals/:id` | Update savings goal progress | Yes |

---

## 🔒 Security & Privacy Architecture

FinFlow enforces defense-in-depth principles across every architectural layer:

1. **Why `.env` is Kept Off GitHub:**
   - Database credentials and JWT secrets must never be exposed publicly.
   - `.env` is registered in `.gitignore` to prevent credential exposure.
   - Sample files (`.env.example`) provide reference structures without secrets.

2. **Why `node_modules` is Kept Off GitHub:**
   - Prevents bloating repositories with 35,000+ third-party files.
   - `package.json` ensures deterministic, fast installation via `npm install`.

3. **Data Protection & Cryptography:**
   - Passwords hashed using `bcryptjs` with 10 salt rounds.
   - User database schemas use `select: false` on password hashes.
   - JWT tokens validated per request; every query verifies `userId: req.user._id` to enforce strict multi-tenant boundary isolation.

---

## 📂 Project Structure

```text
Expense-and-budget-magnagment-platform/
├── .gitattributes              # GitHub Linguist language configurations
├── .gitignore                  # Protection against committing secrets & dependencies
├── README.md                   # Complete architectural documentation
├── package.json                # Monorepo orchestration scripts (concurrently)
├── scripts/
│   └── seedDemoData.js         # Cloud database seeder with realistic financial history
│
├── client/                     # Frontend Application (React 18 + Vite)
│   ├── .env.example            # Client environment blueprint
│   ├── index.html              # HTML5 entrypoint with Google Fonts
│   ├── package.json            # Client dependencies (Recharts, Tailwind, Lucide, Axios)
│   ├── tailwind.config.js      # Custom theme color palette and styling tokens
│   ├── vite.config.js          # Vite build and proxy configuration
│   └── src/
│       ├── api/                # API client services (auth, dashboard, budgets, goals)
│       ├── components/         # Modular presentation & layout components
│       │   ├── common/         # AddTransactionModal, MetricCards
│       │   ├── dashboard/      # CashFlowChart, ExpenseBreakdown, NetWorthCard
│       │   └── layout/         # Header, Sidebar, MobileNavigation, AppLayout
│       ├── context/            # AuthContext (sessions) & ThemeContext (dark/light)
│       ├── pages/              # Dashboard, Transactions, Budgets, Goals, Auth
│       ├── routes/             # ProtectedRoute & AppRoutes router
│       └── styles/             # Global CSS and CSS custom properties
│
└── server/                     # Backend API Server (Node.js + Express)
    ├── .env.example            # Backend environment blueprint
    ├── package.json            # Server dependencies (Mongoose, JWT, Helmet, Bcrypt)
    ├── scripts/                # Database seeder scripts
    ├── tests/                  # Automated integration tests
    └── src/
        ├── app.js              # Express app, middleware pipeline, and CORS setup
        ├── server.js           # Server bootstrap and graceful shutdown hooks
        ├── config/             # MongoDB connection with DNS resolution & retry
        ├── controllers/        # Business logic for auth, transactions, budgets, goals
        ├── middleware/         # JWT verification, rate limiter, global error handler
        ├── models/             # Mongoose schemas: User, Account, Transaction, Budget, Goal
        ├── routes/             # REST route declarations
        └── services/           # Financial calculation engine (cash flow, net worth)
```

---

## 📜 Available Scripts

| Command | Action |
|---|---|
| `npm run dev` | Runs **both** Server and Client concurrently |
| `npm run dev:server` | Runs the Express backend server with Nodemon reload |
| `npm run dev:client` | Runs the Vite client development server |
| `npm run install:all` | Installs dependencies for root, client, and server |
| `npm run seed` | Seeds realistic demo financial accounts and transactions |
| `npm run test` | Runs the backend API and calculation test suite |
| `npm run build` | Compiles the client for production deployment |

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
Crafted with ❤️ for modern financial clarity and wealth architecture.
</div>
