<div align="center">

# ⚡ FraudShield AI

### Enterprise Credit Card Fraud Detection Platform

[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://docker.com)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.4-F7931E?logo=scikit-learn)](https://scikit-learn.org)
[![CI](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?logo=github-actions)](/.github/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

**Production-grade fraud detection platform with dual-model ML, SHAP explainability, JWT auth, RBAC, and a full enterprise SaaS dashboard — built to Visa/JPMorgan engineering standards.**

[Live Demo](#) · [API Docs (Swagger)](#) · [Architecture](docs/architecture.md) · [Model Card](ml/models/model_card.md)

</div>

---

## 🎯 What This Is

FraudShield AI is not a Jupyter notebook. It is a **deployed, dockerized, auth-protected, audit-logged fraud detection platform** with:

- **Dual-model ML**: Logistic Regression (supervised, primary) + Isolation Forest (unsupervised, secondary anomaly signal) — the same architecture pattern used in real production fraud systems
- **SHAP explainability**: Every prediction returns the top-5 feature contributions — *why* it was flagged, not just *that* it was
- **Enterprise auth**: JWT HS256 in `httpOnly` cookies, rotating refresh tokens, bcrypt(cost=12), RBAC enforced server-side
- **Audit compliance**: Append-only audit log enforced at the **database level** (UPDATE/DELETE revoked on the app role)
- **Full operational UI**: 15 pages covering everything a fraud risk team actually needs — triage, batch review, analytics, model monitoring

> **Career framing**: Most student fraud projects stop at a ROC curve. This stops at a system an engineering leader at Visa could click through in a live demo.

---

## 📊 Model Performance

| Metric | Logistic Regression | Isolation Forest |
|---|---|---|
| **Precision-Recall AUC** | 0.847 | 0.612 |
| **F1 Score (fraud class)** | 0.821 | 0.587 |
| **Recall @ 90% Precision** | 0.743 | 0.401 |
| **ROC-AUC** | 0.979 | 0.894 |

> *Trained on ULB/Kaggle creditcard.csv — 284,807 transactions, 492 fraud (0.172% prevalence). Metrics updated after each training run in `ml/models/*/metrics_logreg.json`.*

**Why these metrics matter**: At 0.172% fraud prevalence, accuracy is meaningless (a model predicting "never fraud" achieves 99.83% accuracy). PR-AUC directly measures performance on the minority (fraud) class — it's the right metric for this problem, and it's what a Data Science interviewer will ask about.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Next.js 14 (App Router) + TypeScript + Tailwind CSS    │
│  shadcn/ui + Recharts + Framer Motion                    │
└──────────────────────┬──────────────────────────────────┘
                        │ REST/JSON (httpOnly cookie auth)
┌──────────────────────▼──────────────────────────────────┐
│  FastAPI + Uvicorn (async)                               │
│  Clean Architecture: API → Service → Repository → ML    │
│  Rate Limiting (slowapi) · Security Headers · CORS       │
└──────────────────────┬──────────────────────────────────┘
                        │
           ┌────────────┴────────────┐
           ▼                         ▼
    PostgreSQL 16              ML Inference Service
    (5 tables, audit            (joblib models,
    log append-only)            SHAP explainer)
```

**Docker services**: `fraudshield-db` (PostgreSQL) + `fraudshield-api` (FastAPI) + `fraudshield-web` (Next.js) + `nginx` (prod profile, reverse proxy)

**ML training path** (offline, separate from the request path):
```
creditcard.csv → validate → stratified split → preprocess → train LR + IF → evaluate → SHAP → artifacts
```

---

## 🔐 Security Architecture

This section is intentionally detailed — security decisions are documented here as a first-class concern, not an afterthought.

| Control | Implementation | Standard |
|---|---|---|
| Authentication | JWT HS256 in `httpOnly + Secure + SameSite=Lax` cookies | Eliminates XSS token theft (vs. localStorage) |
| Token lifecycle | Access: 15min, Refresh: 7d rotating, stored hashed in DB | Revocable, leakage-resistant |
| Password hashing | bcrypt, cost factor 12 | OWASP recommended minimum |
| Authorization | RBAC enforced in FastAPI dependencies (server-side) | Frontend role checks are UX-only |
| SQL injection | SQLAlchemy ORM only — zero raw string interpolation | OWASP A03 |
| Input validation | Pydantic v2 on every endpoint | Fails fast, precise error messages |
| Audit log integrity | `REVOKE UPDATE, DELETE ON audit_logs` for the app DB role | Tamper-evident even if app is compromised |
| CORS | Allow-list from env var, not `*` | OWASP A05 |
| Security headers | X-Frame-Options, X-Content-Type-Options, Referrer-Policy | Applied in middleware and nginx |
| Rate limiting | slowapi: 5/min auth, 60/min predict | Brute-force and abuse protection |
| Secrets | Pydantic Settings from `.env`, never hardcoded | Fails on missing required vars |

---

## 📁 Project Structure

```
fraudshield-ai/
├── apps/
│   ├── api/                    # FastAPI backend
│   │   ├── app/
│   │   │   ├── api/v1/         # Routers (auth, predictions, analytics, admin)
│   │   │   ├── core/           # Config, security, middleware, dependencies
│   │   │   ├── models/         # SQLAlchemy ORM (5 tables)
│   │   │   ├── schemas/        # Pydantic request/response models
│   │   │   ├── services/       # Business logic layer
│   │   │   ├── repositories/   # DB access layer (repository pattern)
│   │   │   ├── ml/             # ML inference service + SHAP wrapper
│   │   │   └── main.py
│   │   ├── alembic/            # DB migrations
│   │   └── tests/              # Unit + integration + API tests
│   └── web/                    # Next.js 14 frontend
│       ├── app/                # App Router (15 pages)
│       ├── components/         # UI + charts + layout components
│       ├── lib/                # Typed API client, auth, utils
│       ├── types/              # TypeScript interfaces
│       └── contexts/           # Auth context (SWR)
├── ml/
│   ├── pipeline/               # Modular training scripts (importable, tested)
│   ├── models/                 # Versioned .joblib artifacts + model_card.md
│   ├── notebooks/              # EDA only (no production logic)
│   ├── data/                   # raw/ and processed/ (gitignored)
│   └── tests/                  # Leakage, metric regression, pipeline tests
├── infra/
│   ├── docker/                 # Dockerfiles (api, web, ml)
│   ├── nginx/                  # Reverse proxy config
│   └── postgres/               # DB init scripts
├── docs/                       # Architecture, API guide, deployment guide
├── .github/workflows/          # CI: lint + typecheck + test + docker build
├── docker-compose.yml          # Dev stack (db + api + web)
├── docker-compose.prod.yml     # Prod overlay (+ nginx)
└── .env.example                # All env vars documented
```

---

## 🚀 Quick Start

### Prerequisites
- Docker Desktop (recommended) OR Python 3.11+ and Node.js 20+
- 4 GB RAM minimum for Docker stack

### Option A: Docker (Recommended)

```bash
# 1. Clone the repo
git clone https://github.com/your-username/fraudshield-ai.git
cd fraudshield-ai

# 2. Configure environment
cp .env.example .env
# Edit .env: set a strong SECRET_KEY

# 3. Start all services
docker compose up -d

# 4. Seed demo data (first time only)
docker compose exec fraudshield-api python -m app.seed

# 5. Access the platform
# Frontend: http://localhost:3000
# API Docs (Swagger): http://localhost:8000/docs
# API Docs (ReDoc):   http://localhost:8000/redoc
```

**Demo credentials** (after seeding):
| Email | Password | Role |
|---|---|---|
| `admin@fraudshield.ai` | `Admin@123456` | Admin |
| `analyst@fraudshield.ai` | `Analyst@123456` | Analyst |
| `auditor@fraudshield.ai` | `Auditor@123456` | Auditor |

### Option B: Local Development

```bash
# Backend
cd apps/api
pip install -r requirements.txt
cp ../../.env.example .env  # configure DATABASE_URL
alembic upgrade head
python -m app.seed
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd apps/web
npm install
npm run dev  # http://localhost:3000

# ML Pipeline (optional — train your own models)
cd ml
pip install -r requirements.txt
# Download creditcard.csv from Kaggle (see ml/data/README.md)
python pipeline/run_pipeline.py --data-path data/raw/creditcard.csv
```

---

## 🤖 ML Pipeline

### Running the Training Pipeline

```bash
cd ml
pip install -r requirements.txt

# Download dataset from Kaggle:
# https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud
# Place at: ml/data/raw/creditcard.csv

python pipeline/run_pipeline.py --data-path data/raw/creditcard.csv

# Artifacts saved to ml/models/v{timestamp}/
# - model_logreg_{version}.joblib
# - model_isoforest_{version}.joblib
# - scaler.joblib + shap_logreg.joblib
# - metrics_logreg.json + metrics_isoforest.json
# - model_card.md
# - plots/ (ROC, PR curve, confusion matrix, SHAP summary)
```

### Key ML Design Decisions

**Why Logistic Regression as primary model?**
The dataset has labels (fraud/not-fraud), so supervised learning is strictly more appropriate than unsupervised. LR gives calibrated probabilities (not just rankings), is SHAP-explainable via `LinearExplainer`, and achieves PR-AUC of 0.847 on this dataset.

**Why Isolation Forest as secondary?**
Real production fraud systems run supervised models for *known* fraud patterns AND unsupervised anomaly detection for novel attack patterns that the label distribution hasn't seen yet. IF provides this second signal without requiring labels — the final prediction is a weighted combination: `0.7 × LR_proba + 0.3 × normalized_IF_score`.

**Why `class_weight='balanced'` over SMOTE?**
SMOTE on a 0.172% prevalence dataset is a well-known way to inflate validation metrics if applied outside the CV loop. `class_weight='balanced'` achieves the same effect (upweighting the minority class loss) without generating synthetic fraud samples that could contaminate evaluation. SMOTE is documented as an ablation in the model card.

**Leakage prevention**:
- Scaler fitted ONLY on training data, applied to test via `.transform()` (never `.fit_transform()` on test)
- Stratified split preserves fraud prevalence in both train and test
- No enrichment data used as model features (synthetic Country/Merchant is UI-only — see model card)

---

## 📈 API Reference

Full interactive docs at `http://localhost:8000/docs` (Swagger UI) and `http://localhost:8000/redoc`.

Key endpoints:

```
POST /api/v1/auth/login           — Authenticate, receive httpOnly cookies
POST /api/v1/predict              — Single transaction fraud prediction
POST /api/v1/predict/batch        — Batch CSV upload
GET  /api/v1/predictions          — Paginated prediction history
GET  /api/v1/dashboard/kpis       — Dashboard KPI metrics
GET  /api/v1/analytics/roc        — ROC curve data
GET  /api/v1/analytics/pr-curve   — Precision-Recall curve data
GET  /api/v1/models               — Model version registry
GET  /api/v1/audit-logs           — Audit log (admin/auditor only)
GET  /health                      — Health check
GET  /ready                       — Readiness probe
```

---

## 🧪 Testing

```bash
# ML tests
cd ml && pytest tests/ -v --cov=pipeline

# Backend tests  
cd apps/api && pytest tests/ -v --cov=app

# Frontend type check
cd apps/web && npx tsc --noEmit && npm run lint
```

Coverage targets: ≥70% on services and ML layers. CI fails below this threshold.

---

## 🗺️ Roadmap

| Version | Feature |
|---|---|
| **v1.0** (current) | Dual-model LR + IF, full dashboard, SHAP, auth, RBAC, audit log, Docker |
| **v1.1** | XGBoost as third model, model drift detection alerts |
| **v1.2** | IEEE-CIS dataset integration (richer features — real merchant/country data) |
| **v2.0** | Adversarial ML robustness testing (ties to cybersecurity track) |

---

## 📚 Documentation

- [Architecture](docs/architecture.md) — System design, component interactions, data flow
- [API Guide](docs/api-guide.md) — Complete endpoint reference with examples
- [Deployment Guide](docs/deployment.md) — Local, Docker, and cloud deployment
- [Model Card](ml/models/model_card.md) — Training data, features, metrics, limitations

---

## 🛠️ Tech Stack

| Layer | Technology | Justification |
|---|---|---|
| ML | Scikit-learn, Pandas, NumPy | Industry standard, interviewer-recognized |
| Explainability | SHAP | Industry standard for ML explainability |
| API | FastAPI + Uvicorn | Async-native, auto OpenAPI, dominant in ML-serving stacks |
| ORM | SQLAlchemy 2.0 + Alembic | Repository pattern, typed queries, migration support |
| Database | PostgreSQL 16 | ACID, JSONB, row-level security, fintech standard |
| Auth | python-jose + bcrypt | JWT + secure password hashing |
| Frontend | Next.js 14 + TypeScript | SSR, App Router, typed end-to-end |
| UI | shadcn/ui + Tailwind CSS | Accessible primitives, full customization |
| Charts | Recharts | React-native, responsive, composable |
| Animation | Framer Motion | Production-grade micro-animations |
| Container | Docker + Compose | Reproducible dev and prod environments |
| CI | GitHub Actions | Lint + test + build on every PR |

---

## 📄 License

MIT — see [LICENSE](LICENSE). Dataset subject to [Kaggle terms](https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud).

---

<div align="center">
Built with engineering standards suitable for demonstration at Visa, Mastercard, JPMorgan, and Google.
</div>
