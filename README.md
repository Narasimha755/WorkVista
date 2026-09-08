# WorkVista — Workforce Productivity Prediction Platform

> **Predict · Plan · Perform**  
> Enterprise-grade AI platform for workforce analytics, productivity forecasting, risk identification, and strategic capacity management.

---

## 1. Project Overview

WorkVista is an advanced, production-grade People Analytics platform designed for HR leaders, operations managers, and business partners. It transforms raw employee data (CSV/XLSX) into predictive intelligence using machine learning pipelines, automatic data validation, explainable AI, and interactive visualizations.

### Core Highlights:
- **100% Data-Driven & Truthful**: Zero fabricated analytics or synthetic trend curves (`np.sin`, fake monthly projections). Transparent reporting on cross-sectional vs longitudinal observations.
- **Unified Single-Port Deployment**: FastAPI serves both the complete compiled React SPA and all REST API endpoints at a single access link (`http://localhost:8000`).
- **HR Profile NARASIMHA**: Built-in executive profile for **NARASIMHA** (`HR Analytics`), with full author attribution across audit trails, reports, and notes.
- **Dynamic ML Prediction Pipeline**: Automatic detection of regression vs classification targets, training Random Forest, Gradient Boosting, or Ridge models with honest evaluation metrics ($R^2$, MAE, RMSE, MAPE).
- **Decoupled Performance Status vs Risk Level**: Productivity status (High $\ge 80$, Medium $50\text{--}79$, Low $< 50$) is cleanly separated from burnout and attendance risk (High $\ge 70$, Moderate $30\text{--}69$, Low $< 30$).
- **Local & Global Explainability**: SHAP-style factor attributions explaining *why* an employee is forecasted to improve or decline.
- **Database-Backed Notes & Tasks**: Real SQLite-persisted review notes and actionable follow-up tasks with pending/completed toggles.
- **Programmatic ReportLab PDF Generation**: Real binary PDF downloads for Executive Summaries and complete Employee Profile Dossiers (PDF, CSV, JSON).

---

## 2. Technology Stack

### Frontend:
- **Framework**: React 18 with TypeScript
- **Tooling**: Vite (pre-built into `dist/` and mounted onto FastAPI)
- **Styling**: Tailwind CSS with enterprise slate/blue theme
- **Icons**: Lucide React
- **Data Visualization**: Recharts (Area, Line, Bar, Pie/Donut, Scatter)

### Backend:
- **Framework**: Python 3.11+ / FastAPI
- **Data Processing**: pandas, numpy
- **Machine Learning**: scikit-learn, scipy, joblib
- **Database**: SQLite (SQLAlchemy 2.0 ORM with auto-schema migration)
- **Validation**: Pydantic v2
- **Document Generation**: ReportLab (PDF), openpyxl (Excel)
- **Testing**: pytest (15 comprehensive unit & integration tests)

---

## 3. Architecture

```
workvista/
├── backend/
│   ├── app/
│   │   ├── api/routes/          # REST endpoints (upload, dashboard, employees, predictions, analytics, departments, model, reports, settings, export)
│   │   ├── core/                # App config, database engine, schema migration
│   │   ├── ml/                  # ML pipeline, trainer, predictor, explainability
│   │   ├── models/              # SQLAlchemy ORM models (Employees, Predictions, Notes, Tasks, Reports, AuditLogs)
│   │   ├── schemas/             # Pydantic v2 schemas
│   │   ├── services/            # Data cleaner, column mapper, synthetic demo generator, insights, ReportLab PDF generator
│   │   └── main.py              # Single-port entrypoint mounting static React SPA & CORS
│   ├── data/                    # Storage for uploads, models, database
│   ├── tests/                   # Pytest test suite (15 passing tests)
│   ├── pytest.ini
│   └── requirements.txt
├── frontend/
│   ├── dist/                    # Compiled production build served by FastAPI
│   ├── src/
│   │   ├── components/          # Reusable UI widgets: layout, KPI cards, charts, tables, modals
│   │   ├── pages/               # Dashboard, Employees, Predictions, Analytics, Departments, Reports, ModelPerformance, Settings
│   │   ├── services/            # Typed API client
│   │   ├── types/               # TypeScript interfaces
│   │   ├── App.tsx              # Shell & layout
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── test_e2e_verification.py     # End-to-end verification script
├── .env.example
├── .gitignore
└── README.md
```

---

## 4. Quick Start (Single Unified Server)

### Prerequisites:
- Python 3.10+
- (Optional) Node.js 18+ (only needed if modifying frontend source)

### Run with Python:
```powershell
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start the unified application
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Open your browser to:
👉 **[http://localhost:8000](http://localhost:8000)**

* Interactive API Documentation (Swagger): `http://localhost:8000/docs`
* ReDoc: `http://localhost:8000/redoc`

---

## 5. Development Mode (Optional)

If developing frontend and backend simultaneously:

```powershell
# Terminal 1: Backend
cd backend
python -m uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and automatically proxies `/api` calls to `http://localhost:8000`.

---

## 6. Running Tests

Run the backend test suite:
```powershell
cd backend
python -m pytest tests -v
```
Output: **15 passed in 5.20s**

Run the end-to-end automated verification:
```powershell
python test_e2e_verification.py
```
Output: **All 7 E2E checks passed (Health, Dashboard, Analytics, Notes & Tasks, ReportLab PDF, Settings, Audit User)**

---

## 7. License

MIT License. Developed by Lakshmi Narasimha Chowdary Machineni.
