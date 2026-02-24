# DrugAuthChain
### Decentralized Anti-Counterfeit Medicine Protocol

> **Scan once. Trust forever. Protect lives.**

---

## Submission Links

- **Round 1 Concept Video:** [proposal video](https://drive.google.com/file/d/1AD_LOIG-bt_lQ9AQ2detqqCPlQJz3jm3/view?usp=sharing)
- **project statement** [github](https://github.com/Allenchongtham/DrugAuthChain/blob/main/PROJECT%20PROPOSAL%20(1).pdf) [drive](https://drive.google.com/file/d/1r9kMC28NDWWYCC-FOrwEHFFgk1zJuTNd/view?usp=sharing)
- **proposed solution** [github](https://github.com/Allenchongtham/DrugAuthChain/blob/main/PROJECT%20PROPOSAL%20(1).pdf) [drive](https://drive.google.com/file/d/1r9kMC28NDWWYCC-FOrwEHFFgk1zJuTNd/view?usp=sharing)
- **project proposal** [github](https://github.com/Allenchongtham/DrugAuthChain/blob/main/PROJECT%20PROPOSAL%20(1).pdf) [drive](https://drive.google.com/file/d/1r9kMC28NDWWYCC-FOrwEHFFgk1zJuTNd/view?usp=sharing)
- **roadmap** [github](https://github.com/Allenchongtham/DrugAuthChain/blob/main/ROADMAP.pdf) [drive](https://drive.google.com/file/d/1xHgHZe5CCtq9fDrFKs9tBaKue4sh_rdK/view?usp=sharing)
- **tech stack** [github](https://github.com/Allenchongtham/DrugAuthChain/blob/main/TECH%20STACK.pdf) [drive](https://drive.google.com/file/d/1XUHGJ1mgc4dcWyH7iBWytsqn3ehXLxsR/view?usp=sharing)
- **Demo video** [drive](https://drive.google.com/file/d/1KtWE2wCY0xreUTwYcsX9RCBz1NnTRoed/view?usp=sharing)

---

## The Problem

Counterfeit medicines are a global crisis. Consumers have no reliable way to verify whether the medicine they're holding is genuine — and static QR codes on packaging are trivially easy for counterfeiters to clone and reuse.

**DrugAuthChain solves this at the cryptographic level.**

---

## Our Solution

DrugAuthChain is a hybrid blockchain-powered app that gives consumers instant, tamper-proof medicine verification — and automatically invalidates any QR code the moment it's scanned.

The core innovation is our **"Burn on Scan"** mechanism:

1. **Mint** — A manufacturer registers a medicine batch on the blockchain. Status: `ACTIVE`
2. **Scan** — A consumer scans the QR code. The smart contract checks its status.
3. **Burn** — If `ACTIVE` → returns **Authentic** and flips status to `SOLD`. If already `SOLD` → returns **Fake**

Once a package is scanned and verified, **no counterfeiter can refill and resell it** — the on-chain record has already been burned.

---

## Completed Features

| # | Feature | Status |
|---|---|---|
| 1 | `DrugAuth.sol` smart contract with `registerMedicine` + `verifyAndBurn` | ✅ Done |
| 2 | Hardhat local blockchain for development and demo | ✅ Done |
| 3 | Mock manufacturer script — registers 5 medicines and generates QR PNGs | ✅ Done |
| 4 | React consumer web app with MetaMask wallet connection | ✅ Done |
| 5 | QR code scanning via image upload (jsQR, canvas-based) | ✅ Done |
| 6 | Burn-on-scan transaction flow via ethers.js | ✅ Done |
| 7 | Green / Red visual feedback screen (Authentic vs Fake/Used) | ✅ Done |
| 8 | Deployment support for Polygon Amoy via Tenderly Virtual TestNet | ✅ Done |

---

## Architecture Overview

```
Manufacturer Script           Consumer Web App
       │                             │
  mint.js (Node)              React + ethers.js
       │                             │
       │  registerMedicine()         │  verifyAndBurn()
       ▼                             ▼
  DrugAuth.sol  ◄──────── DrugAuth.sol
  (Hardhat / Amoy)         (Hardhat / Amoy)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contracts | Solidity 0.8.24 + Hardhat |
| Blockchain (local) | Hardhat Network (Chain ID 31337) |
| Blockchain (testnet) | Polygon Amoy via Tenderly Virtual TestNet |
| Frontend | React 18 + Vite |
| Web3 | ethers.js v6 |
| QR Scanning | jsQR (canvas-based, no camera needed) |
| QR Generation | qrcode (npm) |

---

## Local Development Setup

### Prerequisites

- [Node.js](https://nodejs.org) v18+
- [MetaMask](https://metamask.io/download) browser extension

### 1. Install dependencies

```bash
# Root (Hardhat + scripts)
npm install

# Frontend
cd client && npm install && cd ..
```

### 2. Start the local blockchain

Run this in a **dedicated terminal** and keep it open:

```bash
npm run node
```

You'll see 20 accounts each with 10,000 ETH printed in the terminal.

### 3. Deploy the smart contract

```bash
npm run deploy
```

This deploys `DrugAuth.sol` to localhost and automatically updates the frontend contract address in `client/.env.local`.

### 4. Register test medicines and generate QR codes

```bash
npm run mint
```

This registers 5 medicines on-chain and saves `test_qrs/qr_1.png` through `qr_5.png`.

### 5. Start the frontend

> **Important:** Start the frontend **after** deploying so it picks up the correct contract address.

```bash
cd client && npm run dev
```

Open `http://localhost:3000`.

> If you redeploy the contract while the frontend is running, you must **restart the Vite dev server** for it to pick up the new address.

---

## MetaMask Setup (one-time)

### Add the Hardhat network

1. Open MetaMask → click the network dropdown → **Add a network manually**
2. Fill in:

| Field | Value |
|---|---|
| Network name | `Hardhat Local` |
| RPC URL | `http://127.0.0.1:8545` |
| Chain ID | `31337` |
| Currency symbol | `ETH` |

3. Click **Save**

### Import a funded test account

1. MetaMask → click the account icon (top right) → **Add account or hardware wallet** → **Import account**
2. Paste this private key (Hardhat Account #0):
```
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```
3. Click **Import** — the account will show 10,000 ETH

> This is a publicly known test key. Never use it on a real network.

### Switch to Hardhat Local

Make sure MetaMask is switched to the **Hardhat Local** network before connecting the app.

### Clear MetaMask cache (important!)

Every time you restart the Hardhat node, MetaMask caches stale nonces and chain data from the previous session. This causes transactions to hang or fail silently.

**After every Hardhat node restart:**

1. MetaMask → Settings → Advanced → **Clear activity tab data**
2. This resets cached nonces so transactions work correctly against the fresh node

---

## Demo Flow

| Test | Action | Expected Result |
|---|---|---|
| Happy path | Upload `qr_1.png` → Confirm in MetaMask | Screen turns **GREEN** — Authentic |
| Already used | Upload `qr_1.png` again | Screen turns **RED** — Already burned |
| Fake QR | Upload any random QR from the internet | Screen turns **RED** — Not registered |

---

## Project Structure

```
DrugAuthChain/
├── contracts/
│   └── DrugAuth.sol          # Smart contract
├── scripts/
│   ├── deploy.js             # Deploy to localhost or Amoy
│   ├── mint.js               # Register medicines + generate QR PNGs
│   └── generate-wallet.js    # One-time deployer wallet generator
├── client/
│   ├── src/
│   │   ├── App.jsx           # Main consumer UI
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── hardhat.config.js
├── .env.example              # Copy to .env and fill in for testnet deploy
└── package.json
```

---


## Team — ALGAERITHM

- **Chongtham Allen**
- **James Khuraijam**
- **Khuraijam Dijen**

---

## Impact

- **Social:** Directly combats counterfeit drugs that cause thousands of preventable deaths annually
- **Economic:** Protects manufacturer brand integrity and consumer trust
- **Scalable:** Polygon's low gas fees make per-scan verification economically viable at mass-market scale

---

> *Built for hackathon submission — DrugAuthChain MVP running on Hardhat local network.*
