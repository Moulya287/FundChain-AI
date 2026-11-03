# FundChain AI

### AI-Powered Blockchain Crowdfunding with Milestone-Based Fund Management

FundChain AI is a decentralized crowdfunding application that combines **blockchain technology and machine learning** to make crowdfunding more transparent, accountable, and data-driven.

The platform allows campaign creators to raise funds, define project milestones, submit proof of completed work, and receive funds through a milestone-based approval process. It also integrates an AI-powered Trust Engine that analyzes live campaign information and generates campaign success probability, trust scores, and recommendations.

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Our Solution](#our-solution)
- [Key Features](#key-features)
- [How It Works](#how-it-works)
- [Technology Stack](#technology-stack)
- [AI Trust Engine](#ai-trust-engine)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Running the Project](#running-the-project)
- [Team & Roles](#team--roles)
- [Future Improvements](#future-improvements)

---

## Problem Statement

Traditional crowdfunding platforms can make it difficult for contributors to track how collected funds are being used. Common challenges include:
- Limited transparency regarding fund utilization.
- Difficulty tracking campaign progress.
- Lack of structured verification of project milestones.
- Uncertainty about campaign credibility and likelihood of success.

FundChain AI aims to address these challenges through blockchain-based fund management and AI-assisted campaign analysis.

## Our Solution

FundChain AI introduces a milestone-based crowdfunding model. Instead of treating the collected amount as immediately available to the campaign creator, the platform organizes fund distribution around predefined milestones.

Campaign creators submit proof when a milestone is completed. Eligible contributors can participate in the milestone voting process. Once the milestone is approved and finalized, the corresponding funds can be released according to the smart contract rules. The AI Trust Engine provides additional insights by analyzing campaign activity and progress.

## Key Features

### 1. Decentralized Campaign Creation
- Create crowdfunding campaigns.
- Specify funding goals and campaign duration.
- Define project milestones.

### 2. Blockchain-Based Contributions
- Contributors support campaigns using cryptocurrency (ETH).
- Contributions are recorded securely through smart contract transactions.
- Campaign funding information is retrieved in real-time from the blockchain.

### 3. Milestone-Based Fund Release
- Campaign creators submit proof for completed milestones.
- Eligible contributors vote on milestone submissions.
- Voting results are finalized after the voting period.
- Funds are released only when the milestone satisfies the smart contract conditions.

### 4. Transparent Campaign Tracking
- View campaign information and funding progress.
- Track milestones and their approval status.
- View submitted milestone proof and voting information.

### 5. Role-Based Access Control
The application dynamically distinguishes between different user roles:
- **Campaign Owner:** Creates campaigns, manages milestones, and submits proof. *Cannot vote on their own milestones.*
- **Contributor:** Supports campaigns and participates in eligible milestone voting.
- **Owner-Contributor:** A campaign owner who has also contributed their own funds.
- **Visitor:** Can view publicly available campaign information and AI analytics.

### 6. AI-Powered Trust Engine
- Predicts campaign success probability using a trained Machine Learning model.
- Generates a campaign trust score based on milestone completion.
- Provides dynamic recommendations based on campaign activity and progress.
- Uses live campaign information collected directly from the blockchain.

---

## How It Works

1. **Create a Campaign:** A creator publishes a campaign with a funding goal, duration, and milestones.
2. **Contribute Funds:** Backers support the campaign through MetaMask. Funds are locked in the smart contract.
3. **Submit Milestone Proof:** The creator submits evidence of completed work for a specific milestone.
4. **Vote on Milestones:** Eligible contributors vote to approve or reject the submitted proof.
5. **Finalize Voting:** After the time-lock period, the voting is finalized.
6. **Release Funds:** If approved, the allocated ETH is released to the creator. If rejected, funds remain locked.
7. **Analyze with AI:** The AI Trust Engine evaluates the live on-chain data and provides a success probability and trust score.

---

## Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React, Vite, TypeScript |
| Styling | Custom CSS (Dark Web3 Theme) |
| Blockchain | Solidity, Ethereum-compatible blockchain |
| Smart Contract Development | Hardhat |
| Blockchain Interaction | Viem |
| Wallet | MetaMask |
| AI / Machine Learning | Python, Scikit-Learn |
| Machine Learning Model | Random Forest Classifier |
| Backend | FastAPI |
| Data Validation | Pydantic |
| Model Storage | Joblib |

---

## AI Trust Engine

FundChain AI integrates a Machine Learning component to analyze campaign performance. The project uses a **Random Forest Classifier** trained using synthetic historical campaign data. 

The model uses the following features:
- Campaign funding progress.
- Days remaining until deadline.
- Number of unique backers.
- Number of approved milestones.
- Whether the campaign creator has contributed their own funds.

**AI Outputs:**
- **Success Probability:** An estimate of the campaign's likelihood of reaching its funding goal.
- **Trust Score:** An assessment generated by analyzing the creator's milestone completion rate.
- **Recommendations:** Dynamic suggestions based on current financial velocity and community engagement.

### Backend API
The FastAPI backend exposes a prediction endpoint (`POST /predict`). The frontend gathers campaign information from the blockchain and sends the relevant features to the AI backend for processing.

*Note: The current model is trained on synthetic data. Its predictions are experimental and should not be interpreted as independently verified fraud detection or financial advice.*

---

## Project Structure

```text
FundChain-AI/
│
├── ai-backend/
│   ├── fundchain_model.joblib
│   └── train_and_serve.py
│
├── contracts/
│   └── FundChain.sol
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── pages/
│       ├── utils/
│       │   └── roles.ts
│       ├── App.tsx
│       ├── contract.ts
│       └── FundChainArtifact.json
│
├── scripts/
│   └── deploy.ts
│
├── test/
│
├── artifacts/
├── cache/
│
├── hardhat.config.ts
├── package.json
├── package-lock.json
├── tsconfig.json
├── .gitignore
└── README.md
