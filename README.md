# ScanIQ

> **Scan. Verify. Understand.**

ScanIQ is an AI-powered product intelligence platform that turns barcodes and QR codes into structured, verified, and understandable product information — pulling from external data providers, cross-checking identity evidence, and explaining the results in plain language with AI.

<p align="left">
  <a href="https://scan-iq-phi.vercel.app">Live App</a> ·
  <a href="https://scaniq-1.onrender.com/api/v1/health">API Health</a> ·
  <a href="#-getting-started">Getting Started</a> ·
  <a href="#-api-reference">API Reference</a>
</p>

---

## 🔗 Live Demo

| | URL |
| :--- | :--- |
| **Frontend** | https://scan-iq-phi.vercel.app |
| **Backend API** | https://scaniq-1.onrender.com |
| **Health Check** | https://scaniq-1.onrender.com/api/v1/health |

> ⚠️ The backend is hosted on Render's free tier and may take up to ~30s to spin up after inactivity.

---

## 🚀 Core User Journey

```
Scan / Enter Barcode
        │
        ▼
Identify Product  (Redis Cache → PostgreSQL → External Providers)
        │
        ▼
Retrieve Structured Data  (UPCitemdb · Open Food Facts)
        │
        ▼
Cross-Source Verification  (consensus & provenance analysis)
        │
        ▼
Explain with AI  (Google Gemini grounding & plain-language insights)
        │
        ▼
Compare, Save & Revisit  (Favorites & Scan History)
```

### Lookup Flow in Detail

```
Barcode
   │
   ▼
Redis Cache ── Hit ──────────────────► Return Product (< 500ms)
   │
  Miss
   │
   ▼
PostgreSQL ── Found ─────► Cache in Redis ──► Return Product
   │
  Not Found
   │
   ▼
External Providers (UPCitemdb, Open Food Facts)
   │
   ▼
Normalize & Deduplicate
   │
   ▼
Persist to PostgreSQL + Cache in Redis
   │
   ▼
Return Product
```

Products that can't be found anywhere are negatively cached in Redis, so repeated lookups for the same nonexistent barcode fail fast instead of re-querying every provider.

---

## ✨ Features

- **📷 Barcode & QR Scanner** — Live camera scanning via `@zxing/browser` and `html5-qrcode`, with debounced duplicate-scan detection, camera permission handling, and manual barcode entry fallback.
- **🏷️ Multi-Format Support** — EAN-13, EAN-8, UPC-A, and QR codes.
- **⚡ Two-Tier Caching** — Redis in front of PostgreSQL for sub-500ms repeated lookups, including negative caching for products that don't exist.
- **🌐 Multi-Provider Data Enrichment** — Aggregates and normalizes product metadata from UPCitemdb and Open Food Facts, with deduplication, ingredient parsing, and nutrition normalization.
- **🛡️ Cross-Source Verification** — Compares identity evidence across independent providers and classifies products as `VERIFIED`, `PARTIALLY_VERIFIED`, or `UNABLE_TO_VERIFY` — without leveling false-positive counterfeit accusations.
- **🤖 AI Product Explanations** — Google Gemini explains complex product data, highlights key ingredients, separates facts from interpretation, and avoids unsupported health or medical claims.
- **🔒 Secure Authentication** — JWT access tokens, bcrypt password hashing (12 salt rounds), and user-isolated scan history and favorites.
- **🔍 Catalog Search** — Sub-string and attribute search by product name, brand, barcode, or model number.
- **📱 Responsive PWA** — Works across desktop and mobile browsers.

---

## 🛠️ Architecture & Tech Stack

```
ScanIQ Client (React 19 + TypeScript + Vite + Tailwind CSS v4)
         │
         │ REST API  (/api/v1)
         ▼
Express Monolith API (Node.js + TypeScript + Express 5)
  ├── Security & Middleware   (Helmet, CORS, Rate Limiters, Request-ID, Zod)
  ├── Controllers & Services  (Auth, Product, Scan, Favorite, Search, AI, Verification)
  └── Data Layer
        ├── Redis (ioredis)          — cache & negative caching
        ├── PostgreSQL (Prisma ORM)  — persistent storage
        └── External Providers       — UPCitemdb, Open Food Facts, Google Gemini
```

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Vite, React Router v7 |
| **Backend** | Node.js (v20+/v22+), Express 5, TypeScript, TSX |
| **Database** | PostgreSQL with Prisma 7 ORM |
| **Caching** | Redis (ioredis) |
| **AI Engine** | Google Gemini API (`@google/genai`) |
| **Testing** | Node.js Native Test Runner (`node:test`) |

---

## 📁 Repository Structure

```
ScanIQ/
├── client/                     # Frontend SPA
│   ├── src/
│   │   ├── api/                # API client & HTTP fetch wrappers
│   │   ├── components/         # Reusable UI (BarcodeScanner, etc.)
│   │   ├── pages/               # Route pages (HomePage, ScannerPage, ProductDetailsPage)
│   │   ├── services/            # Product and verification services
│   │   └── types/                # Client-side TypeScript interfaces
│   ├── package.json
│   └── vite.config.ts
│
├── server/                     # Backend API
│   ├── prisma/
│   │   ├── migrations/         # PostgreSQL schema migrations
│   │   └── schema.prisma       # Prisma data model definition
│   ├── src/
│   │   ├── config/              # Environment, Redis, Prisma, AI, and Auth config
│   │   ├── controllers/         # Route controllers
│   │   ├── middleware/          # Auth, validation, logging, rate limiting, errors
│   │   ├── repositories/        # Prisma database access layer
│   │   ├── routes/               # Express API routes
│   │   ├── services/             # Business logic, normalizers, AI & verification
│   │   ├── utils/                 # App errors, cache keys, timeout fetchers
│   │   ├── validators/           # Zod schemas for request validation
│   │   ├── app.ts                 # Express application configuration
│   │   └── server.ts             # Server lifecycle & graceful shutdown
│   └── package.json
│
├── .agents/                     # Agent & security audit configurations
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js** v20.x or v22.x
- **PostgreSQL** — local or hosted (e.g. Neon, Supabase)
- **Redis** — local or hosted (e.g. Upstash, Redis Cloud)
- **Google Gemini API key** — for AI-powered product explanations

### Backend Setup (`server/`)

```bash
cd server
npm install
```

Create a `.env` file inside `server/`:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/scaniq?schema=public

# Cache (Redis)
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your_super_secret_jwt_key_must_be_at_least_32_characters

# AI Integration
AI_API_KEY=your_gemini_api_key_here
AI_MODEL=gemini-2.0-flash
```

Run migrations and start the server:

```bash
npx prisma migrate dev
npm run dev
```

The backend API runs at `http://localhost:5000`.

### Frontend Setup (`client/`)

```bash
cd client
npm install
```

Optionally create a `.env` file inside `client/`:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

Start the dev server:

```bash
npm run dev
```

The frontend runs at `http://localhost:5173`.

---

## 📡 API Reference

Base URL: `/api/v1`

### Health

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `GET` | `/health` | Service health status | No |

### Authentication

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/auth/register` | Register new user account | No |
| `POST` | `/auth/login` | Log in and receive JWT token | No |
| `GET` | `/auth/me` | Fetch authenticated user profile | Yes |

### Products & Scanner

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `GET` | `/products/barcode/:barcode` | Lookup product by barcode (cache-first) | No |
| `POST` | `/products/barcode/:barcode/refresh` | Force refresh product from providers | No |
| `GET` | `/products/:productId` | Fetch product by database ID | No |
| `GET` | `/products/search?q=...&limit=20` | Search products by keyword, brand, or model | No |
| `GET` | `/products/:productId/verification` | Run multi-source verification checks | No |

### AI

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/ai/explain` | Generate AI explanation for product data | No |

### User Features (Scans & Favorites)

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/scans` | Record a scan event | Yes |
| `GET` | `/scans?page=1&limit=20` | List user scan history | Yes |
| `DELETE` | `/scans/:id` | Remove an item from scan history | Yes |
| `POST` | `/favorites/:productId` | Add product to favorites | Yes |
| `GET` | `/favorites` | List all favorited products | Yes |
| `DELETE` | `/favorites/:productId` | Remove product from favorites | Yes |

---

## 🧪 Testing

```bash
cd server
npm test
```

Backend tests use Node.js's built-in test runner (`node:test`).

---

## 🗺️ Roadmap

- [ ] Additional barcode providers for broader coverage
- [ ] Offline scan queueing for PWA installs
- [ ] Product comparison view (side-by-side)
- [ ] Public read-only API rate tiers

---

## 🤝 Contributing

Issues and pull requests are welcome. Please open an issue to discuss significant changes before submitting a PR.

---

## 📄 License

ISC License.