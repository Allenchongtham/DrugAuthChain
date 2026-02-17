# DrugAuthChain
### Decentralized Anti-Counterfeit Medicine Protocol

> **Scan once. Trust forever. Protect lives.**

---

## Submission Links

- **Round 1 Concept Video:** `hackathon vid 2.mov`

---

## The Problem

Counterfeit medicines are a global crisis. Consumers have no reliable way to verify whether the medicine they're holding is genuine — and static QR codes on packaging are trivially easy for counterfeiters to clone and reuse.

**DrugAuthChain solves this at the cryptographic level.**

---

## Our Solution

DrugAuthChain is a hybrid blockchain-powered mobile app that gives consumers instant, tamper-proof medicine verification — and automatically invalidates any QR code the moment it's scanned.

The core innovation is our **"Burn on Scan"** mechanism:

1. **Mint** — A manufacturer registers a medicine batch on the blockchain. Status: `ACTIVE`
2. **Scan** — A consumer scans the QR code. The smart contract checks its status.
3. **Burn** — If `ACTIVE` → returns **Authentic** and flips status to `SOLD`. If already `SOLD` → returns **Fake**

Once a package is scanned and verified, **no counterfeiter can refill and resell it** — the on-chain record has already been burned.

---

## Key Features

| Feature | Description |
|---|---|
| Burn on Scan | Single-use QR verification that invalidates itself on first legitimate scan |
| Visual Feedback | Lottie animations give instant, language-agnostic results (green / red) |
| Counterfeit Heatmap | Admin dashboard visualizing global fake-scan hotspots for supply chain investigation |
| Offline Verification | Pre-loaded public keys allow signature verification even without internet access |

---

## Architecture Overview

```
Manufacturer App          Consumer App           Admin Dashboard
      │                        │                        │
      │  Input Batch ID        │  Scan QR Code          │  View Heatmap
      ▼                        ▼                        ▼
 Flutter Frontend ──────── Flutter Frontend ──── Leaflet.js Map
      │                        │                        │
      │  Ethers.js             │  Ethers.js             │  Firebase
      ▼                        ▼                        ▼
 Smart Contract  ◄──────── Smart Contract          Fake Scan Logs
 (Polygon Amoy)            (Polygon Amoy)
      │
      ▼
   IPFS Storage
 (Batch Metadata)
```
![WhatsApp Image 2026-02-17 at 10 06 32 PM](https://github.com/user-attachments/assets/dad9f34a-cf9b-46b6-90f8-6cd945dd9f97)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile App | Flutter (Dart) — iOS & Android |
| Blockchain | Polygon Amoy Testnet |
| Smart Contracts | Solidity + Hardhat |
| QR Scanning | Google ML Kit (on-device, offline-capable) |
| Backend | Firebase (auth, logs, alerts) |
| Decentralized Storage | IPFS |
| Analytics | Leaflet.js |

---

## Roadmap

**Phase 1 — Qualifying Round** *(In Progress)*
- [ ] Finalize user flow and system architecture
- [ ] Set up Flutter + Hardhat development environment
- [ ] Write and deploy Solidity smart contracts (`registerMedicine`, `verifyMedicine`)
- [ ] Build Manufacturer Dashboard with Ethers.js integration
- [ ] Set up Firebase for non-blockchain data

**Phase 2 — Final Excellence Round**
- [ ] Integrate Google ML Kit QR scanner + Burn on Scan logic
- [ ] Design result screens with Lottie animations
- [ ] Build Leaflet.js Admin Heatmap
- [ ] Implement offline verification
- [ ] Edge-case testing + bug fixing
- [ ] Create physical demo props and record final demo video

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



> *Built for hackathon submission — DrugAuthChain is currently deployed on Polygon Amoy Testnet.*
