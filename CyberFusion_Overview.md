# CyberFusion Pro - Project Overview

**Connecting Cyber Attacks to Financial Crime Before the Money Disappears**

CyberFusion Pro is the world's first **Cyber-to-Financial Crime Graph Intelligence Platform**. It serves as a unified intelligence layer between Security Operations Center (SOC) teams and Anti-Money Laundering (AML) teams. It detects and correlates cyber events with suspicious financial transfers to stop fraud and crypto exit points before they execute.

## 🚨 The Problem It Solves

Historically, SOC teams focus on cyber events (e.g., phishing, session hijacking) and AML teams focus on financial events (e.g., unusual velocities, mule accounts). Because these systems are siloed, organized fraud exploits this lag. CyberFusion bridges this gap by correlating signals from both domains to provide a unified **kill chain graph**, stopping transactions in real time.

---

## 🏗 Architecture & Tech Stack

### High-Level Architecture
- **Frontend Layer (UI and Visualization):** Built with React 19, Recharts, and D3.js the system visualizes the entire attack infrastructure via dynamic graphs and radar charts.
- **Backend Service:** Powered by FastAPI (Python 3.11), storing alerts, accounts, and ML scoring metrics inside a Neon PostgreSQL Database.
- **AI/ML Layer:** 
  - **Google Gemini 1.5 Flash / 3.1 Pro:** Provides real-time threat analysis, threat attributions, SOC briefing generation, and draft SAR filings.
  - **TensorFlow MuleDetector v2.3:** A pre-trained model (AUC-ROC: 0.9923) evaluating 47 behavioral and structural features to identify mule accounts.
- **Enforcement Layer:** 
  - **Blockchain:** Ethereum Sepolia Testnet using Solidity 0.8.20 (`CyberFusionGuard.sol`) with ethers.js / MetaMask. Employs on-chain rejection of flagged mule activity.
  - **Payment Gateways:** Integrates with Razorpay test mode to actively intercept transfers.

### Full Tech Stack

| Domain | Technologies Used |
|--------|-------------------|
| **Frontend Platform** | React 19.2, React Router DOM v7, Framer Motion, JSX, Lucide Icons |
| **Data Visualization** | D3.js (Force Graph), Recharts (Radar/Sparklines), SVG |
| **API & Backend** | FastAPI, Uvicorn, Python 3.11/3.12, SQLAlchemy, psycopg |
| **Database** | PostgreSQL (Hosted on Neon) |
| **Web3 & Blockchain** | Solidity 0.8.20, ethers.js v6, MetaMask, Sepolia Testnet |
| **AI & Intelligence** | Google Generative Language API (Gemini) |
| **Machine Learning** | TensorFlow 2.14, Scikit-learn, SHAP |
| **Payment Gateway** | Razorpay SDK (checkout.js integration) |

---

## 🔥 Key Intelligence Features

### 1. 🕸️ Kill Chain Graph
The heart of CyberFusion. Using **D3.js Force Simulation**, it displays a linked chain mapping the attack path—spanning dark web forums and phishing kits, compromised victim banks, sequential mule hops, and eventual crypto exits. Analysts can trace the life cycle of a cyber-financial crime.

### 2. 🧠 Machine Learning Engine (MuleDetector v2.3)
Trained on a normalized dataset of ~2.8 million records, this model detects compromised nodes.
- **Inputs:** 47 combined features (transaction velocity, geo-anomalies, graph centrality, AT/phishing probabilities). 
- **Performance:** 4.1ms latency inference with a 0.9923 AUC score.
- **Result:** Ranks accounts across 4 buckets: `Legitimate`, `Mule`, `Compromised`, and `Exit Point`. 

### 3. 🤖 Gemini AI Threat Analysis
Gemini evaluates account behaviors and graph nodes asynchronously. Uses low-temperature generation (0.3) for consistency. Generates short analyst briefings, SAR reports, and recommends remediation actions against specific attacks.

### 4. ⛓️ Blockchain On-Chain Freezing
Analysts can instantly freeze crypto wallets using a deployable Solidity Smart Contract (`CyberFusionGuard.sol`). 
- Executed via `flagAccount(address, reason)`.
- It physically drops any state transfer to/from blacklisted nodes via EVM-level runtime `REVERT` blocks, intercepting them mid-stride.

### 5. 💳 Active Payment Interception
Integrates with modern rails like Razorpay (Using Demo/Test keys) to show real-time session intercept capabilities in the critical window between payment authorization and settlement.

---

## 💾 Project Structure & Data Models

### Internal Directories
- `src/` (Frontend React Application)
  - `components/` - UX widgets, Alert feeds, D3 integration, GlassCards.
  - `context/` - Global Context APIs (Alerts & Blockchain Contexts).
  - `pages/` - Routable dash views (`/`, `/killchain`, `/transactions`, `/accounts`, etc.)
- `backend/` (FastAPI Server)
  - `main.py` - Core App, CORS configurations, and react-router fallback servers.
  - `models.py` - SQLAlchemy Base ORM bindings.
  - `schemas.py` - Pydantic Request/Response validation.
  - `routes/` - Specific endpoint groups (`alerts`, `dashboard`, `accounts`, `logins`, `transactions`).
  - `seed.py` - Mock data bootstrap generator.
- `contracts/` (Solidity Files) - Target deployment contracts to Remix and Sepolia.
- `ml_model/` - Weights, shape structures, metadata, SHAP explanations, and tensor flow serialized nodes.

### Backend Database Schema (Key Entities)
- **`Account`**: `account_id`, `name`, `cyber_score`, `txn_score`, `final_score`, `status`, profiling data.
- **`Device`**: Tracking fingerprints, trusted states.
- **`LoginEvent`**: IPs, Geocoding flags, `vpn_detected`, payload sizes, calculated risks.
- **`Transaction`**: Standard transfers containing values, `time_flags`, receiver names.
- **`Alert`**: `txn_id`, `account_id`, `severity` (Critical, High, Medium, Info), `description`, status.

---

## ⚙️ Environment Variables & Deployment

CyberFusion's `.env` systems consist of shared database and LLM endpoints.

| Variable Name | Purpose | Location |
|---|---|---|
| `DATABASE_URL` | Neon PG instance routing | `root` and `/backend` |
| `GEMINI_API_KEY` | LLM text endpoint access | `root` and `/backend` |
| `FRONTEND_ORIGIN` | Allowed domains for FastAPI | `root` and `/backend` |
| `CONTRACT_ADDRESS` | Deployed address for Sepolia | React Frontend / JS Configs |
| `RAZORPAY_KEY` | Test-mode API key for intercepts | React Frontend / JS Configs |

The frontend runs locally on **Port 3000** via `npm start`.
The FastAPI backend runs locally on **Port 8000** via `uvicorn main:app --reload`.

All data generated in the frontend connects automatically through the FastAPI JSON proxy router configured in React's `package.json` proxy parameter.
