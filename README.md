# 📚 BookLoop — Campus Book Exchange Platform

> A smart, sustainable peer-to-peer book exchange platform built for college students.  
> Powered by AI appraisal, Fuzzy Logic valuation, ANN recommendations, and a virtual BookCoin economy.

---

## 🌟 What is BookLoop?

**BookLoop** eliminates the pain of overpriced textbooks by enabling students to **list, discover, and redeem** second-hand academic books using **BookCoins** — a virtual campus currency — instead of real money.

Every book is automatically appraised by AI, assigned a fair coin value using Fuzzy Logic, and personalized recommendations surface the most relevant books for each student via an Artificial Neural Network.

---

## 🧠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite, Vanilla CSS, Lucide Icons |
| **Backend / Auth / DB** | Supabase (PostgreSQL + Row Level Security + Storage) |
| **AI Appraisal** | Google Gemini Vision API (multi-photo analysis) |
| **Fuzzy Valuation ML** | Python + scikit-fuzzy (Mamdani inference) |
| **Trust Score ML** | Python + scikit-fuzzy (buyer/seller credibility) |
| **ANN Recommendation** | PyTorch (collaborative filtering neural network) |
| **ML Service** | FastAPI + Uvicorn (REST API serving all 3 ML modules) |
| **Edge Functions** | Supabase Deno Edge Functions (3 serverless functions) |

---

## 🚀 Features

- 📸 **Multi-photo Book Listing** — upload up to 5 photos (front, back, spine, inside, distance)
- 🤖 **AI Appraisal** — Gemini Vision analyzes condition from photos and suggests coin value
- 🧮 **Fuzzy Logic Valuation** — `original_price × condition_grade × demand` → fair BookCoin price
- 🛡️ **Trust Score System** — dynamic seller credibility score updated on every rating
- 🎯 **ANN Recommendations** — personalized "For You" book suggestions per student
- 💰 **BookCoin Economy** — earn coins by listing, spend coins to redeem books
- 🏫 **Campus-scoped** — students see books from their own campus first
- 🌿 **Eco Metrics** — tracks CO₂ saved and trees preserved per exchange
- 📱 **Fully Responsive** — works on desktop, tablet, and mobile

---

## 📁 Project Structure

```
bookloop/
├── src/
│   ├── pages/           # 8 React pages (Landing, Browse, Dashboard, etc.)
│   ├── components/      # Reusable UI components
│   ├── context/         # AppContext (global state, auth, toasts)
│   ├── lib/             # Supabase client, helpers
│   └── data/            # Demo/mock data for offline mode
├── ml-service/
│   ├── app/
│   │   ├── api/         # FastAPI route handlers
│   │   ├── core/        # ML modules (fuzzy, ANN, trust)
│   │   └── utils/       # Shared utilities
│   ├── train_ann.py     # ANN training script (PyTorch)
│   └── requirements.txt
├── supabase/
│   ├── schema.sql       # Full DB schema + RLS + storage setup
│   └── functions/       # 4 Edge Functions (Deno/TypeScript)
└── .env.example         # Environment variable template
```

---

## ⚙️ Running Locally

### Prerequisites
- Node.js 18+
- Python 3.10+
- A Supabase project (free at [supabase.com](https://supabase.com))

### 1. Clone & Install Frontend

```bash
git clone https://github.com/your-username/bookloop.git
cd bookloop
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and fill in:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_public_key
VITE_GEMINI_API_KEY=your_gemini_api_key   # optional
```

### 3. Apply Supabase Schema

1. Go to your Supabase project → **SQL Editor**
2. Paste the full contents of `supabase/schema.sql`
3. Click **Run**

### 4. Start the ML Service

```bash
cd ml-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The ML API will be live at: **http://localhost:8000/docs**

### 5. Start the Frontend

```bash
# In the project root
npm run dev
```

App runs at: **http://localhost:5173**

> **Demo Mode**: If you skip steps 2–4, the app still runs in offline/demo mode with mock data — no credentials required.

---

## 🧪 ML Service Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/valuation` | POST | Fuzzy Logic coin value for a book |
| `/api/trust` | POST | Trust score for a seller based on ratings |
| `/api/recommend` | POST | ANN-based personalized book recommendations |

Interactive docs: `http://localhost:8000/docs`

---

## ☁️ Deploying the ML Service

For a live demo, deploy the ML service to any platform:

**Railway (easiest):**
```bash
# In ml-service/
railway init
railway up
```
Then update `ML_SERVICE_URL` in your Supabase Edge Function Secrets to the Railway URL.

**Render / Fly.io:** Also work — just point to `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

---

## 🗄️ Supabase Edge Functions

| Function | Trigger | Purpose |
|----------|---------|---------|
| `analyze-book` | HTTP POST | Gemini AI appraisal of book photos |
| `fuzzy-valuation` | HTTP POST | Fuzzy Logic valuation via ML service |
| `recommend-books` | HTTP POST | ANN recommendation via ML service |
| `update-trust-score` | DB Webhook (ratings INSERT) | Recalculate seller trust score |

---

## 👥 Team

Built as a Semester 5 Capstone Project.

---

## 📄 License

MIT License — free to use for academic and educational purposes.
