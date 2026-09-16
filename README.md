# ScanIQ

> **Tagline:** Scan. Verify. Understand.  
> **Platform:** Web / Mobile-responsive PWA  
> **Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Node.js, Express 5, PostgreSQL, Prisma ORM, Redis, Google Gemini

ScanIQ is an AI-powered product intelligence platform that turns physical product identifiers (barcodes and QR codes) into structured, verified, and understandable information.

---

## 🚀 Core User Journey

```
Scan / Enter Barcode
        ↓
Identify Product (Redis Cache → PostgreSQL → External APIs)
        ↓
Retrieve Structured Product Data (UPCitemdb / Open Food Facts)
        ↓
Cross-Source Verification (Consensus & provenance analysis)
        ↓
Explain with AI (Google Gemini grounding & plain-language insights)
        ↓
Compare & Save (Favorites & Scan History)
```

---

## ✨ Features

- **📷 Barcode & QR Scanner:** Live camera scanning powered by `@zxing/browser` and `html5-qrcode` with debounced scan detection, camera permission handling, and manual barcode entry fallback.
- **🏷️ Multi-Format Support:** Identifies common barcode standards including EAN-13, EAN-8, and UPC-A.
- **⚡ Two-Tier Caching & Persistence:** Redis caching layer in front of PostgreSQL ensures sub-500ms response times for repeated lookups, with negative caching for non-existent products.
- **🌐 Multi-Provider Data Enrichment:** Aggregates product metadata from UPCitemdb and Open Food Facts with automatic deduplication, ingredient parsing, and nutrition normalization.
- **🛡️ Cross-Source Product Verification:** Analyzes identity evidence across independent providers to categorize products into `VERIFIED`, `PARTIALLY_VERIFIED`, or `UNABLE_TO_VERIFY` (avoiding false-positive counterfeit accusations).
- **🤖 AI Product Explanations:** Explains complex product data, highlights key ingredients, distinguishes facts from interpretations, and avoids unsupported health or medical claims.
- **🔒 Secure Authentication:** JWT-based access tokens, bcrypt password hashing (12 salt rounds), and user-isolated scan history and favorites.
- **🔍 Catalog Search:** Sub-string and attribute search by product name, brand, barcode, or model number.

---

## 🛠️ Architecture & Tech Stack

```
ScanIQ Client (React 19 + TypeScript + Vite + Tailwind CSS v4)
         │
         │ REST API (/api/v1)
         ▼
Express Monolith API (Node.js + TypeScript + Express 5)
  ├── Security & Middlewares (Helmet, CORS, Rate Limiters, Request-ID, Zod)
  ├── Controllers & Services (Auth, Product, Scan, Favorite, Search, AI, Verification)
  └── Data Layer
        ├── Redis (ioredis - In-memory Cache & Negative Caching)
        ├── PostgreSQL (Prisma 7 ORM)
        └── External Providers (UPCitemdb, Open Food Facts, Google Gemini)
```

### Stack Details

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Vite, React Router v7 |
| **Backend** | Node.js (v20+), Express 5, TypeScript, TSX |
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
│   │   ├── pages/              # Route pages (HomePage, ScannerPage, ProductDetailsPage)
│   │   ├── services/           # Product and verification services
│   │   └── types/              # Client-side TypeScript interfaces
│   ├── package.json
│   └── vite.config.ts
├── server/                     # Backend API
│   ├── prisma/
│   │   ├── migrations/         # PostgreSQL schema migrations
│   │   └── schema.prisma       # Prisma data model definition
│   ├── src/
│   │   ├── config/             # Environment, Redis, Prisma, AI, and Auth config
│   │   ├── controllers/        # Route controllers
│   │   ├── middleware/         # Auth, validation, logging, rate limiting, errors
│   │   ├── repositories/       # Prisma database access layer
│   │   ├── routes/             # Express API routes
│   │   ├── services/           # Business logic, normalizers, AI & verification
│   │   ├── utils/              # App errors, cache keys, timeout fetchers
│   │   ├── validators/         # Zod schemas for request validation
│   │   ├── app.ts              # Express application configuration
│   │   └── server.ts           # Server lifecycle & graceful shutdown
│   └── package.json
├── .agents/                    # Agent & security audit configurations
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js:** v20.x or v22.x
- **PostgreSQL:** Running instance (local or hosted, e.g., Neon / Supabase)
- **Redis:** Running instance (local or hosted, e.g., Upstash / Redis Cloud)
- **Google Gemini API Key:** For AI-powered product summaries

---

### Backend Setup (`server/`)

1. **Navigate to the server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file inside `server/` with the following:
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

4. **Run Database Migrations:**
   ```bash
   npx prisma migrate dev
   ```

5. **Start Development Server:**
   ```bash
   npm run dev
   ```
   The backend API will run on `http://localhost:5000`.

---

### Frontend Setup (`client/`)

1. **Navigate to the client directory:**
   ```bash
   cd ../client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional):**
   Create a `.env` file inside `client/`:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api/v1
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```
   The frontend app will run on `http://localhost:5173`.

---

## 📡 API Reference

Base URL: `/api/v1`

### Health
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/health` | Service health status | No |

### Authentication
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/auth/register` | Register new user account | No |
| `POST` | `/auth/login` | Log in and receive JWT token | No |
| `GET` | `/auth/me` | Fetch authenticated user profile | Yes |

### Products & Scanner
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/products/barcode/:barcode` | Lookup product by barcode (cache-first) | No |
| `POST` | `/products/barcode/:barcode/refresh` | Force refresh product from providers | No |
| `GET` | `/products/:productId` | Fetch product by database ID | No |
| `GET` | `/products/search?q=...&limit=20` | Search products by keyword/brand/model | No |
| `GET` | `/products/:productId/verification` | Run multi-source verification checks | No |

### AI
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/ai/explain` | Generate AI explanation for product data | No |

### User Features (Scans & Favorites)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/scans` | Record a scan event | Yes |
| `GET` | `/scans?page=1&limit=20` | List user scan history | Yes |
| `DELETE` | `/scans/:id` | Remove an item from scan history | Yes |
| `POST` | `/favorites/:productId` | Add product to favorites | Yes |
| `GET` | `/favorites` | List all favorited products | Yes |
| `DELETE` | `/favorites/:productId` | Remove product from favorites | Yes |

---

## 🧪 Testing

The backend includes test coverage using Node.js built-in test runner (`node:test`):

```bash
cd server
npm test
```

---

## 📄 License

ISC License.

