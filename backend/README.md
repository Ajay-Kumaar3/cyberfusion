# CyberFusion Backend — Setup Guide

## Prerequisites
- Python 3.11+
- PostgreSQL running locally (port 5432)

## Quick Start

```bash
# 1. Go to backend directory
cd d:\cyberfusion\backend

# 2. Create virtual environment
python -m venv venv
venv\Scripts\activate       # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create PostgreSQL database
# Open psql or pgAdmin and run:
#   CREATE DATABASE cyberfusion;

# 5. Copy and configure .env
copy .env.example .env
# Edit .env:
#   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/cyberfusion
#   GEMINI_API_KEY=your_key_here

# 6. Seed the database (200 accounts + data)
python seed.py

# 7. Start the server
uvicorn main:app --reload --port 8000
```

## API Docs
Open: http://localhost:8000/docs (Swagger UI auto-generated)

## Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/dashboard/summary | Dashboard stat cards |
| GET | /api/accounts | All accounts (sorted by risk) |
| GET | /api/accounts/{id} | Account detail + timeline |
| GET | /api/logins | Login events |
| POST | /api/logins | Add login event (auto-scores) |
| GET | /api/transactions | Transactions |
| POST | /api/transactions | Add transaction (auto-scores + alerts) |
| GET | /api/alerts | All alerts |
| PATCH | /api/alerts/{id} | Update alert status |
| POST | /api/alerts/{id}/explain | Generate Gemini AI explanation |
| GET | /health | Health check |
