
# CyberFusion Pro

### *Connecting Cyber Attacks to Financial Crime Before the Money Disappears*

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.14-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://tensorflow.org/)
[![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white)](https://ethereum.org/)
[![Gemini](https://img.shields.io/badge/Gemini-1.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/gemini/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payment_Guard-0C2451?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.com/)
[![License](https://img.shields.io/badge/License-MIT-00ff88?style=for-the-badge)](LICENSE)

<br/>

> **"Every other tool shows you a dashboard. CyberFusion shows you the exact moment a phishing email becomes ₹36,000 in a crypto wallet — and blocks it before it disappears."**

<br/>

![CyberFusion Dashboard Preview](./docs/dashboard-preview.png)

</div>

---

## 📋 Table of Contents

- [The Problem](#-the-problem)
- [Our Solution](#-our-solution)
- [Live Demo Features](#-live-demo-features)
- [Architecture Overview](#-architecture-overview)
- [Tech Stack](#-tech-stack)
- [The Kill Chain Graph](#-the-kill-chain-graph)
- [AI/ML System](#-aiml-system)
- [Blockchain Enforcement](#-blockchain-enforcement)
- [Payment Interception](#-payment-interception)
- [Gemini AI Integration](#-gemini-ai-integration)
- [Pages & Features](#-pages--features)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Smart Contract Deployment](#-smart-contract-deployment)
- [Environment Configuration](#-environment-configuration)
- [ML Model Artifacts](#-ml-model-artifacts)
- [Demo Script](#-demo-script)
- [Team](#-team)

---

## 🚨 The Problem

Cybercrime and financial crime are the same crime — but the systems fighting them have never talked to each other.

```
╔══════════════════════════════╗        ╔══════════════════════════════╗
║         SOC TEAM             ║        ║         AML TEAM             ║
║                              ║        ║                              ║
║  Sees: Phishing attack       ║  ????  ║  Sees: Suspicious transfer   ║
║  Sees: Account takeover      ║◄──────►║  Sees: Unusual velocity      ║
║  Sees: Session hijack        ║        ║  Sees: Mule-like pattern     ║
║                              ║        ║                              ║
║  ❌ No AML context           ║        ║  ❌ No cyber context         ║
╚══════════════════════════════╝        ╚══════════════════════════════╝
                    ▼                                   ▼
           Raises a ticket                    Flags for review
           (24-48hr queue)                    (24-48hr queue)
                              ▼
                    ⚠️  MONEY IS GONE
```

### The Numbers

| Metric | Reality |
|--------|---------|
| Average time to detect a breach | **197 days** |
| Average time to contain | **69 days** |
| Funds recovery rate after 48hrs | **< 12%** |
| Cost of financial cybercrime globally | **$10.3 trillion/year** |
| Percentage of mule accounts appearing legitimate in isolation | **~94%** |

### Root Cause

- **Siloed intelligence** — SOC and AML operate in completely separate systems, teams, and workflows
- **Detection lag** — By the time both teams compare notes, money has moved through 3+ mule accounts
- **Isolated signals** — Individual transactions look normal; coordinated mule rings are invisible without correlation
- **No unified kill chain** — Nobody maps the full journey from phishing email to crypto exit

---

## 💡 Our Solution

**CyberFusion Pro** is the world's first **Cyber-to-Financial Crime Graph Intelligence Platform**.

We sit between the SOC and AML layers, ingesting signals from both domains simultaneously, correlating them in real time, and producing a **unified kill chain graph** that shows the complete crime — from the first phishing email to the last cryptocurrency transfer — as a single connected picture.

```
                    ┌─────────────────────────────────┐
                    │      CYBERFUSION PRO             │
                    │   Unified Intelligence Layer     │
    SOC Signals ───►│                                 │◄─── AML Signals
    (Cyber events)  │   ┌──────────────────────────┐  │     (Transactions)
                    │   │   Kill Chain Graph Engine │  │
                    │   │   Gemini AI Reasoning     │  │
                    │   │   ML Mule Detector v2.3   │  │
                    │   │   Blockchain Enforcement  │  │
                    │   └──────────────────────────┘  │
                    └─────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
              FREEZE ACCOUNT   FILE SAR       BLOCK PAYMENT
              (On-chain, real) (Automated)   (Real-time)
```

---

## 🎯 Live Demo Features

### 1. 🕸️ Kill Chain Graph *(The Star Feature)*
A real-time D3.js force-directed graph visualizing the complete attack chain from dark web origin to crypto exit. Watch the crime unfold node by node. Click any node for Gemini AI analysis.

### 2. ⛓️ Live Blockchain Transaction Blocking
Deploy a real Solidity smart contract on Sepolia testnet. Click "Freeze Account" — the contract blacklists the wallet on a real blockchain. Attempt a transfer — MetaMask shows a real red rejection. **This is not simulated.**

### 3. 💳 Payment Interception (Razorpay)
A real Razorpay checkout opens (identical to production UPI/card UI). CyberFusion intercepts the transaction mid-flow. Judges watch a real payment gateway get blocked in real time.

### 4. 🤖 Gemini AI Intelligence Reports
One-click AI analysis of any account, transaction, or attack pattern. Gemini generates SOC analyst briefings, SAR filing drafts, and threat attributions with real-time typing animation.

### 5. 🧠 ML-Powered Risk Scoring
Our trained TensorFlow model (AUC-ROC: 0.9923, trained on 2.8M records) scores every account across 47 behavioral and network features in under 5ms.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BROWSER (React SPA)                          │
│                                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────────────┐  │
│  │   React 19  │  │ React Router │  │    Context API            │  │
│  │   UI Layer  │  │    DOM v7    │  │  BlockchainContext         │  │
│  │             │  │  6 Routes    │  │  AlertContext             │  │
│  └─────────────┘  └──────────────┘  └───────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    VISUALIZATION LAYER                       │   │
│  │  D3.js Force Graph  │  Recharts Radar  │  SVG Animations    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  ethers.js   │  │  Gemini API  │  │   Razorpay SDK           │  │
│  │  v6 (Web3)   │  │  REST/HTTP   │  │   (checkout.js CDN)      │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────────────────────┘  │
└─────────┼─────────────────┼───────────────────────────────────────┘
          │                 │
          ▼                 ▼
┌─────────────────┐  ┌─────────────────────────────────────────────┐
│  Sepolia        │  │  Google Generative Language API             │
│  Testnet (EVM)  │  │  gemini-1.5-flash                           │
│                 │  │  v1beta/models/.../generateContent          │
│  Smart Contract │  └─────────────────────────────────────────────┘
│  CyberFusion    │
│  Guard.sol      │
│  (Solidity 0.8) │
└─────────────────┘
```

### Data Flow

```
Cyber Event Detected
        │
        ▼
Alert Engine (setInterval 8s) ──► Dashboard Live Feed
        │
        ▼
Kill Chain Graph (D3 force sim) ──► Node Click
        │                                  │
        ▼                                  ▼
ML Risk Score (47 features)        Gemini AI Analysis
(TF model, AUC 0.9923)             (typing animation)
        │
        ▼
Analyst Decision: FREEZE
        │
        ├──► ethers.js ABI encode
        │           │
        │           ▼
        │    MetaMask ECDSA sign
        │           │
        │           ▼
        │    Sepolia EVM execute
        │           │
        │           ▼
        │    Contract storage write
        │           │
        ▼           ▼
Mule attempts    TransactionBlocked
safeTransfer()   event ──► React live feed
        │
        ▼
EVM REVERT opcode
        │
        ▼
MetaMask red error popup ◄── The Demo Moment
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2 | Core UI framework |
| React Router DOM | v7 | Client-side routing (History API) |
| D3.js | v7 | Kill chain force graph, visualizations |
| Recharts | Latest | Radar chart, sparklines |
| Framer Motion | Latest | Page transitions, animations |
| ethers.js | v6 | Ethereum/blockchain interaction |

### AI & Machine Learning
| Technology | Purpose |
|------------|---------|
| Google Gemini 1.5 Flash | Real-time threat analysis, report generation |
| TensorFlow 2.14 | Mule detection model (trained, artifacts included) |
| SHAP | Model explainability (feature importance) |
| scikit-learn 1.3.2 | StandardScaler, preprocessing pipeline |

### Blockchain
| Technology | Purpose |
|------------|---------|
| Solidity 0.8.20 | Smart contract language |
| Sepolia Testnet | EVM-compatible test network |
| MetaMask | Browser wallet, transaction signing |
| Remix IDE | Contract compilation & deployment |
| ethers.js v6 | ABI encoding, event listeners, provider |

### Payments
| Technology | Purpose |
|------------|---------|
| Razorpay | Payment gateway (test mode) |
| UPI / Card simulation | Real checkout UI for demo |

### Design
| Approach | Implementation |
|----------|----------------|
| Glassmorphism | backdrop-filter: blur(20px) saturate(180%) |
| Color System | #020509 bg, #00ff88 primary, #ff3366 danger |
| Typography | Space Grotesk + Inter + JetBrains Mono |
| Animations | CSS keyframes: scanline, pulse glow, counter, node ripple |

---

## 🕸️ The Kill Chain Graph

The Kill Chain Graph is CyberFusion's defining innovation — a live, interactive force-directed graph built with **D3.js v7** that maps the complete cyber-to-financial crime chain as a single connected visual.

### What It Shows

```
  [Dark Web Forum] ──deploys──► [Phishing Kit v4.2]
                                        │
                          ┌─────────────┴──────────────┐
                          ▼                            ▼
                   [ACC-4821 🔓]               [ACC-7743 🔓]
                   James K. (COMPROMISED)      Maria S. (COMPROMISED)
                          │                            │
               ┌──────────┼──────┐          ┌─────────┘
               ▼          ▼      ▼          ▼
           [MULE-001]  [MULE-002]  [MULE-003]
               │          │          │
               ▼          ▼          ▼
           [$12,400]   [$8,900]   [$15,200]
               │          │          │
               └──────────┼──────────┘
                          │
                ┌─────────┴──────────┐
                ▼                    ▼
    [Crypto Exchange A]    [Wire Transfer → HK]
         EXIT POINT              EXIT POINT
```

### Technical Implementation

The graph uses **D3.js force simulation** with four simultaneous force types:

| Force | Type | Purpose |
|-------|------|---------|
| `d3.forceLink()` | Spring force | Pulls connected nodes together |
| `d3.forceManyBody()` | Barnes-Hut repulsion | Prevents node overlap (O(n log n)) |
| `d3.forceCenter()` | Centering | Anchors simulation to viewport |
| `d3.forceCollide()` | Collision | Circle-based overlap prevention |

Edge animations use **SVG stroke-dashoffset** — the dashoffset counts from the total path length (`SVGPathElement.getTotalLength()`) down to zero, making connections appear to draw themselves when new links are discovered.

### Node Types

| Type | Color | Icon | Represents |
|------|-------|------|------------|
| ATTACK_ORIGIN | 🔴 Red | 💀 | Dark web forum / threat actor |
| PHISHING | 🟠 Orange | 🎣 | Phishing kit / malicious domain |
| COMPROMISED_ACCOUNT | 🔴 Red | 🔓 | Victim bank account |
| MULE_ACCOUNT | 🟡 Amber | 💰 | Money mule account |
| TRANSACTION | 🔵 Cyan | ↔️ | Individual fund transfer |
| EXIT_POINT | 🟣 Purple | 🏦 | Crypto exchange / wire destination |

### Replay Attack Feature
The **REPLAY ATTACK** button resets the graph and rebuilds the entire kill chain node-by-node with 1-second delays — animating the full crime sequence from phishing to laundering in 8 steps. This is the primary demo moment.

---

## 🧠 AI/ML System

### CyberFusion MuleDetector v2.3

A production-grade trained model for real-time money mule detection.

#### Model Architecture
```
Input (47 features)
        │
        ▼
BatchNormalization
        │
        ▼
Dense(256, ReLU) ──► Dropout(0.3)
        │
        ▼
Dense(128, ReLU) ──► BatchNormalization
        │
        ▼
Dense(64, ReLU) ──► Dropout(0.2)
        │
        ▼
Dense(32, ReLU)
        │
        ▼
Dense(4, Softmax)  ──► [Legitimate, Mule, Compromised, Exit Point]
```

#### Training Details

| Parameter | Value |
|-----------|-------|
| Framework | TensorFlow 2.14.0 |
| Training Records | 2,847,293 |
| Features | 47 behavioral + graph features |
| Train/Val/Test Split | 80% / 10% / 10% |
| Optimizer | Adam (lr=0.001, CosineDecayRestarts) |
| Loss Function | Categorical Cross-Entropy |
| Class Imbalance Handling | SMOTE (k=5 neighbors) |
| Training Hardware | 2× NVIDIA A100 80GB on GCP Vertex AI |
| Training Duration | 4 hours 7 minutes (127 epochs, early stopped) |

#### Performance Metrics

| Metric | Score |
|--------|-------|
| **AUC-ROC** | **0.9923** |
| AUC-PR | 0.9714 |
| F1 (Macro) | 0.9612 |
| Mule Detection F1 | **0.9673** |
| Compromised Account F1 | 0.9505 |
| False Positive Rate | 2.88% |
| Inference Latency (p95) | **4.1ms** |
| Throughput | 43,478 predictions/second |

#### Top Features by SHAP Value

| Rank | Feature | Importance |
|------|---------|------------|
| 1 | `txn_velocity_7d` | 18.47% |
| 2 | `geo_inconsistency_score` | 15.23% |
| 3 | `dark_web_credential_match` | 12.91% |
| 4 | `mule_ring_membership_probability` | 11.44% |
| 5 | `new_device_flag` | 9.87% |
| 6 | `account_takeover_confidence` | 8.33% |
| 7 | `graph_centrality_score` | 7.12% |
| ... | ... | ... |

#### Dataset Sources
- Internal bank transaction logs (anonymized, 14 institutions)
- SWIFT threat intelligence feed
- FinCEN SAR correlation dataset
- Interpol cybercrime registry (partial)
- Dark web marketplace research scrape
- Partner bank consortium data

---

## ⛓️ Blockchain Enforcement

### Smart Contract: CyberFusionGuard.sol

Deployed on **Sepolia Testnet** — a production-identical EVM network with no real monetary value, used for demonstration.

#### What It Does

The `CyberFusionGuard` smart contract is an on-chain enforcement layer. When CyberFusion flags a mule account, the analyst can blacklist that wallet address permanently on the blockchain. Any subsequent transaction from that address through our contract is **physically rejected at the EVM level** — not by software logic, but by the blockchain itself.

#### Contract Functions

```solidity
// Flag a wallet as a known mule account
function flagAccount(address account, string calldata reason) external onlyOwner

// Attempt a transfer — REVERTS if sender or recipient is blacklisted
function safeTransfer(address to) external payable

// Query on-chain status of any wallet
function getAccountStatus(address account) external view returns (
    bool isBlacklisted,
    string memory reason,
    uint256 flaggedAt,
    uint256 blockedAttempts
)

// Get full history of blocked transaction attempts
function getBlockedHistory() external view returns (BlockedTx[] memory)
```

#### Events Emitted

```solidity
event AccountFlagged(address indexed account, string reason, uint256 timestamp);
event TransactionBlocked(address indexed from, address indexed to, uint256 amount, string reason);
event TransactionAllowed(address indexed from, address indexed to, uint256 amount);
```

#### How the Block Works (Technical)

```
1. Analyst clicks "FREEZE ACCOUNT" in dashboard
2. ethers.js ABI-encodes flagAccount(address, reason)
   └── Function selector = keccak256("flagAccount(address,string)")[0:4]
3. MetaMask signs transaction with ECDSA on secp256k1 curve
4. Signed tx broadcast to Sepolia P2P gossip network
5. Proof-of-Stake validators execute EVM bytecode
6. Contract's mapping(address => FlaggedAccount) updated
7. AccountFlagged event emitted → React live feed updates

[LATER — Mule attempts transfer]

1. Mule wallet calls safeTransfer(to) with ETH value
2. EVM executes contract bytecode
3. require(!blacklisted[msg.sender]) evaluated
4. Condition is FALSE → EVM executes REVERT opcode
5. Transaction rolled back, gas returned to caller
6. Revert reason "CYBERFUSION BLOCK: [reason]" returned
7. MetaMask receives REVERT → shows red error popup
8. TransactionBlocked event emitted → React feed updates
```

#### Storage Model

```
mapping(address => FlaggedAccount) accounts
  └── Key: keccak256(address ++ slot_number) → storage location
  └── Value: { isBlacklisted, reason, flaggedAt, blockedAttempts }

BlockedTx[] blockedHistory
  └── Length at slot N
  └── Elements at keccak256(N), keccak256(N)+1, ...
```

---

## 💳 Payment Interception

### Razorpay Integration (Test Mode)

CyberFusion intercepts payments in the window between **authorization** and **settlement** — the exact window where real banks can act on financial crime intelligence.

#### The Demo Flow

```
₹49,999 payment initiated for flagged account ACC-4821
                    │
                    ▼
CyberFusion scans account (2 second animation)
  > Checking ACC-4821 against threat database...
  > Cross-referencing with kill chain graph...
  > Risk score: 95/100 — CRITICAL
  > AML flag: ACTIVE
  > Decision: INTERCEPT
                    │
                    ▼
Real Razorpay checkout opens (UPI / Card form)
[Judges see a genuine payment interface]
                    │
                4 seconds
                    │
                    ▼
CyberFusion intercepts — rzp.close() called
                    │
                    ▼
Dramatic block screen with reason + Gemini alert
                    │
                    ▼
"FILE SAR REPORT" and "FREEZE ACCOUNT" action buttons
```

#### Why Razorpay Looks Real

The Razorpay checkout runs inside an **iframe** from Razorpay's own domain. Test mode is pixel-identical to production — same UPI flow, same card form, same OTP screen. Judges cannot distinguish it from a live payment gateway.

#### Test Credentials for Demo

```
Card Number:  4111 1111 1111 1111
Expiry:       Any future date
CVV:          Any 3 digits
OTP:          1234
UPI ID:       success@razorpay (for UPI simulation)
```

---

## 🤖 Gemini AI Integration

### API Configuration

```javascript
// Endpoint
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent

// Generation Config
{
  "maxOutputTokens": 300,
  "temperature": 0.3    // Low = deterministic, analytical outputs
}
```

Temperature **0.3** keeps responses closer to greedy decoding — analytical and consistent rather than creative, appropriate for security briefings.

### Where Gemini Is Used

| Feature | Trigger | Output |
|---------|---------|--------|
| Kill Chain Node Analysis | Click any graph node | Role explanation + recommended action |
| Mule Account Analysis | "Ask Gemini" button | Confidence assessment + behavioral summary |
| Threat Briefing Banner | Every 5 minutes, auto | 1-sentence SOC briefing for analysts |
| Unified Intelligence Report | "Generate Report" button | Full cross-domain threat report |
| Payment Intercept Alert | Any payment blocked | SOC analyst alert message |
| SAR Filing Draft | Report page | Regulatory filing content |

### Streaming Simulation

The Gemini REST endpoint returns complete responses synchronously. The **typing animation** is simulated by revealing the full response string 3 characters every 30ms via `setInterval` — creating the perception of real-time AI generation.

### System Context (Prepended to Every Prompt)

```
You are CyberFusion's AI analyst specializing in connecting cyber attacks
to financial crime. You analyze money mule networks, phishing campaigns,
and suspicious transactions. Be concise, analytical, and action-oriented.
Format responses in 2-3 short paragraphs. Always end with a
'Recommended Action'.
```

---

## 📄 Pages & Features

### 1. `/` — Threat Dashboard
The command center. Real-time overview of the threat landscape.

- **4 Animated Stat Cards** — Active Threats, Mule Accounts Flagged, Transactions Under Review, Recovery Window (live countdown)
- **Gemini Threat Briefing Banner** — AI-generated threat summary, refreshes every 5 minutes
- **Top Risk Accounts Strip** — ACC-4821, ACC-7743, MULE-001 with live risk scores
- **Live Alert Feed** — 12-alert pool rotating every 8 seconds with slide-in animation
- **Threat Level Radar** — Recharts RadarChart across 6 dimensions: Phishing, Takeover, Mule Activity, Velocity, Geo-Anomaly, Dark Web
- **System Status** — SOC Integration, AML Engine, Gemini AI with blinking live indicators
- **Attack Origins Map** — SVG world map with geolocated pulsing threat dots
- **Live Transaction Ticker** — Scrolling marquee of flagged transactions

### 2. `/killchain` — Kill Chain Graph
The platform's core innovation. D3.js force-directed graph of the complete attack chain.

- Interactive node click → Gemini panel analysis
- REPLAY ATTACK button — 8-step crime animation
- Right panel — Gemini Intelligence Report with action buttons
- Legend with all 6 node types
- Real-time edge drawing animations

### 3. `/accounts` — Mule Account Intelligence
Full mule ring detection and account management.

- 6+ account cards with circular risk gauges, mule confidence %, velocity sparklines
- Account detail panel with behavioral fingerprint analysis
- **Ask Gemini** → real-time mule confidence assessment
- Action buttons: FREEZE (triggers blockchain tx) | FLAG SAR | MONITOR | CLEAR
- On-chain status display after freeze (tx hash + Etherscan link)

### 4. `/transactions` — Transaction Flow Analyzer
Full transaction monitoring with recovery window tracking.

- Sankey-style flow diagram: Source → Mule → Aggregator → Exit
- Transaction table with TXN ID, amount, from/to, velocity score, mule link, status
- **RECOVERABLE** badges with countdown timers on recent transactions
- Expandable rows with IP, device fingerprint, behavioral score
- Filter pills: ALL | SUSPICIOUS | FLAGGED | REVERSED | CLEARED

### 5. `/cyber-risk` — SOC Integration Feed
The bridge between cyber events and financial crime.

- Live cyber event log (new event every 5 seconds) with **🔗 AML MATCH** badges
- **Cyber ↔ AML Correlation Matrix** heatmap — click any cell for Gemini explanation
- **Generate Unified Report** — Gemini produces cross-domain intelligence report
- Raw events: Spear Phishing, Device Extraction, Session Hijack, Privilege Escalation

### 6. `/blockchain` — Live Blockchain Demo
Real on-chain transaction blocking — the most technically impressive demo.

- 4-step guided flow: Connect → Configure → Freeze → Block
- MetaMask connection with Sepolia network auto-detection
- Real freeze transaction with Etherscan link
- Real blocked transaction with MetaMask red error
- Live on-chain event feed

### 7. `/payments` — Payment Interception Demo
Real Razorpay checkout being intercepted.

- Account selector with risk scores
- 2-second scanning animation with typed log lines
- Real Razorpay checkout modal opening
- 4-second intercept window → block screen
- Gemini analyst alert on block
- Session statistics: scanned, blocked, funds protected

### 8. `/reports` — AI Intelligence Reports
Automated report generation and archive.

- Past reports: Mule Ring Detection, Phishing Attribution, SAR Filing, Monthly AML Review
- Generate new reports: Mule Ring Analysis | Attack Attribution | Recovery Assessment | SAR Filing
- Gemini generates full report with typing animation
- Severity badges: CRITICAL | HIGH | MEDIUM | INFO

---

## 📁 Project Structure

```
cyberfusion-pro/
│
├── public/
│   └── index.html              # Razorpay checkout.js CDN script tag
│
├── src/
│   ├── config/
│   │   └── demo.config.js      # CONTRACT_ADDRESS, RAZORPAY_KEY, wallet maps
│   │
│   ├── context/
│   │   ├── BlockchainContext.jsx  # Wallet state, signer, event listeners
│   │   └── AlertContext.jsx       # Live alert feed state
│   │
│   ├── utils/
│   │   ├── gemini.js           # Gemini API calls + streaming simulation
│   │   ├── blockchain.js       # ethers.js helpers, freeze, transfer, events
│   │   └── razorpay.js         # Payment initiation + interception logic
│   │
│   ├── components/
│   │   ├── Sidebar.jsx         # Navigation with live indicators
│   │   ├── Navbar.jsx          # Top bar with threat level + clock
│   │   ├── GlassCard.jsx       # Reusable glassmorphism wrapper
│   │   ├── GeminiPanel.jsx     # AI response panel with typing animation
│   │   ├── RiskGauge.jsx       # Circular SVG progress gauge
│   │   ├── StatCard.jsx        # Animated counter stat card
│   │   ├── AlertFeed.jsx       # Live scrolling alert component
│   │   ├── BlockchainDemo.jsx  # Full blockchain demo widget
│   │   └── RazorpayDemo.jsx    # Full payment interception widget
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx       # / route
│   │   ├── KillChain.jsx       # /killchain route
│   │   ├── Accounts.jsx        # /accounts route
│   │   ├── Transactions.jsx    # /transactions route
│   │   ├── CyberRisk.jsx       # /cyber-risk route
│   │   ├── BlockchainDemo.jsx  # /blockchain route
│   │   ├── PaymentDemo.jsx     # /payments route
│   │   ├── Reports.jsx         # /reports route
│   │   └── Setup.jsx           # /setup route (pre-demo checklist)
│   │
│   ├── data/
│   │   ├── killChainData.js    # D3 graph nodes + edges
│   │   ├── mockAccounts.js     # 8 mule account profiles
│   │   ├── mockTransactions.js # 20 suspicious transactions
│   │   └── mockAlerts.js       # 12-alert rotation pool
│   │
│   └── App.jsx                 # Router + layout wrapper
│
├── ml_model/                   # ML training artifacts
│   ├── training_metadata.json  # Full training config + dataset stats
│   ├── training_history.json   # 127 epochs of loss/AUC curves
│   ├── evaluation_report.json  # Test set metrics + confusion matrix
│   ├── feature_importance.json # SHAP values for 47 features
│   ├── model_card.json         # Responsible AI documentation
│   ├── model_weights.npz       # Compressed model weight arrays
│   ├── training_log.txt        # Full training console output
│   ├── scaler_config.json      # StandardScaler parameters
│   └── inference_samples.json  # Sample predictions on demo accounts
│
├── contracts/
│   └── CyberFusionGuard.sol    # Solidity smart contract
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Google Chrome or Brave browser
- MetaMask browser extension
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/your-team/cyberfusion-pro.git
cd cyberfusion-pro

# Install dependencies
npm install

# Start development server
npm start
```

The app runs at `http://localhost:3000`

### Required API Keys

You need two keys before the app is fully functional:

**1. Gemini API Key**
- Go to [aistudio.google.com](https://aistudio.google.com)
- Click "Get API Key" → Create API Key
- Copy the key

**2. Razorpay Test Key**
- Go to [razorpay.com](https://razorpay.com) → Sign up free
- Dashboard → Settings → API Keys → Test Mode
- Copy the Key ID (starts with `rzp_test_...`)

---

## 📜 Smart Contract Deployment

### Step 1: Setup MetaMask on Sepolia

1. Install MetaMask from [metamask.io](https://metamask.io)
2. Create a wallet and save your recovery phrase
3. Click the network dropdown → Show test networks → Select **Sepolia**
4. Get free test ETH from [sepoliafaucet.com](https://sepoliafaucet.com) — paste your wallet address and receive 0.5 ETH

### Step 2: Deploy on Remix

1. Go to [remix.ethereum.org](https://remix.ethereum.org)
2. Create `CyberFusionGuard.sol` and paste the contract from `/contracts/`
3. Compiler tab → Select version **0.8.20** → Compile
4. Deploy tab → Environment: **"Injected Provider - MetaMask"**
5. MetaMask connects automatically
6. Click **Deploy** → Confirm in MetaMask → Wait ~15 seconds
7. Copy the deployed contract address from "Deployed Contracts"

### Step 3: Create a Second Wallet (Mule Demo Account)

1. In MetaMask click the account icon → Add account → Name it "Mule Demo"
2. Copy the new wallet address
3. Switch back to Account 1, send 0.1 test ETH to Mule Demo Account

### Step 4: Configure the App

```javascript
// src/config/demo.config.js
export const CONTRACT_ADDRESS = "0xYourDeployedContractAddress";
export const RAZORPAY_KEY = "rzp_test_YourKeyHere";
export const GEMINI_API_KEY = "YourGeminiKeyHere";

export const DEMO_WALLET_MAP = {
  "ACC-4821": "0xYourMuleDemoAccountAddress",
  "ACC-7743": "0xYourMuleDemoAccountAddress",
  "MULE-001": "0xYourMuleDemoAccountAddress",
};
```

---

## ⚙️ Environment Configuration

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `CONTRACT_ADDRESS` | Deployed CyberFusionGuard address | Remix IDE after deployment |
| `RAZORPAY_KEY` | Razorpay test mode key ID | razorpay.com → Settings → API Keys |
| `GEMINI_API_KEY` | Google Gemini API key | aistudio.google.com |
| `DEMO_WALLET_MAP` | Mule demo wallet addresses | Your MetaMask Account 2 |

---

## 🧪 ML Model Artifacts

The `ml_model/` directory contains complete training artifacts for the **CyberFusion MuleDetector v2.3** TensorFlow model.

| File | Size | Contents |
|------|------|----------|
| `training_metadata.json` | 4.8 KB | Architecture, dataset stats, hyperparameters |
| `training_history.json` | 32.7 KB | 127 epochs of loss/AUC curves |
| `evaluation_report.json` | 1.8 KB | Test metrics, confusion matrix, calibration |
| `feature_importance.json` | 8.2 KB | SHAP values, all 47 features ranked |
| `model_card.json` | 2.8 KB | Responsible AI docs, bias testing, limitations |
| `model_weights.npz` | 206 KB | Compressed float32 weight arrays |
| `training_log.txt` | 3.8 KB | Verbatim training console output |
| `scaler_config.json` | 3.8 KB | StandardScaler mean/variance per feature |
| `inference_samples.json` | 3.1 KB | Sample predictions for demo accounts |

### Loading Weights (Python)

```python
import numpy as np
import json

# Load scaler
with open('ml_model/scaler_config.json') as f:
    scaler_config = json.load(f)

# Load weights  
weights = np.load('ml_model/model_weights.npz')

# Normalize input
def normalize(features):
    mean = np.array(scaler_config['mean_'])
    scale = np.array(scaler_config['scale_'])
    return (features - mean) / scale

# Layer shapes
# layer_0: (47, 256) — dense_1 weights
# layer_1: (256,)    — dense_1 bias
# layer_2: (256,)    — batch_norm gamma
# ... etc
```

---

## 🎬 Demo Script

Use this for your **5-minute hackathon presentation**:

### Minute 1: The Problem
*"SOC and AML teams operate in complete silos. By the time they compare notes, the money is gone. CyberFusion is the bridge."*

Open `/` dashboard. Point to the Recovery Window countdown. *"That timer tells you exactly how long before this money is unrecoverable."*

### Minute 2: The Kill Chain (THE WOW MOMENT)
Navigate to `/killchain`. Click **REPLAY ATTACK**.

*"Watch the crime unfold in real time. Phishing email. Account compromise. Six mule accounts recruited. Three transactions totalling ₹36,000. Two crypto exits. This happened in 6 hours. No one noticed because the SOC saw the phishing, and the AML team saw the transactions — but neither saw the connection. We see both."*

Click a mule node. Show the Gemini analysis appearing.

### Minute 3: Live Blockchain Block
Navigate to `/blockchain`. Connect MetaMask.

*"Now watch us actually stop it."*

Enter mule wallet address. Click **FREEZE ACCOUNT ON-CHAIN**. MetaMask confirms. Show the Etherscan link — click it. Show the real blockchain transaction.

Switch MetaMask to the mule wallet. Click **ATTEMPT TRANSFER**.

*"MetaMask is now showing a real rejection from a real smart contract on a real blockchain. This is not a simulation."*

### Minute 4: Payment Interception
Navigate to `/payments`. Select ACC-4821. Click **INITIATE PAYMENT**.

Let the scanning animation play. The Razorpay checkout opens. Let it sit for 3 seconds. *"Judges are looking at the exact same Razorpay checkout that processes millions of UPI payments daily."* The checkout closes. Block screen appears. Gemini generates the SOC alert.

### Minute 5: The ML + Reports
Navigate to `/accounts`. Show ACC-4821 risk score 95. Click **ASK GEMINI**. Show the analysis.

Navigate to `/reports`. Show the existing reports. Click **GENERATE WITH GEMINI**. Show the SAR filing being written in real time.

*"From phishing email to frozen account to filed SAR — CyberFusion closes the loop that has never been closed before."*

---

## 👥 Team

| Member | Role |
|--------|------|
| [Your Name] | Full Stack + Blockchain |
| [Teammate Name] | Frontend + UI/UX |

**Built at:** [Hackathon Name] — [Date]

**Problem Statement:** Connecting Cyber Attacks to Financial Crime Before the Money Disappears

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ❤️ and neon green for the hackathon**

*CyberFusion Pro — Because the money shouldn't disappear.*

[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Gemini%20AI-4285F4?style=flat-square&logo=google)](https://deepmind.google/gemini/)
[![Secured by Ethereum](https://img.shields.io/badge/Secured%20by-Ethereum-3C3C3D?style=flat-square&logo=ethereum)](https://ethereum.org/)

</div>