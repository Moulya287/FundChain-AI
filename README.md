# FundChain AI

### AI-Powered Blockchain Crowdfunding with Milestone-Based Fund Management

FundChain AI is a decentralized crowdfunding application that combines **blockchain technology and machine learning** to make crowdfunding more transparent, accountable, and data-driven.

The platform allows campaign creators to raise funds, define project milestones, submit proof of completed work, and receive funds through a milestone-based approval process.

It also integrates an AI-powered Trust Engine that analyzes live campaign information and generates campaign success probability, trust scores, and recommendations.

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
- [Future Improvements](#future-improvements)

---

## Problem Statement

Traditional crowdfunding platforms can make it difficult for contributors to track how collected funds are being used.

Some common challenges include:

- Limited transparency regarding fund utilization.
- Difficulty tracking campaign progress.
- Lack of structured verification of project milestones.
- Uncertainty about campaign credibility and likelihood of success.

FundChain AI aims to address these challenges through blockchain-based fund management and AI-assisted campaign analysis.

## Our Solution

FundChain AI introduces a milestone-based crowdfunding model.

Instead of treating the collected amount as immediately available to the campaign creator, the platform organizes fund distribution around predefined milestones.

Campaign creators submit proof when a milestone is completed. Eligible contributors can participate in the milestone voting process. Once the milestone is approved and finalized, the corresponding funds can be released according to the smart contract rules.

The AI Trust Engine provides additional insights by analyzing campaign activity and progress.

## Key Features

### 1. Decentralized Campaign Creation
- Create crowdfunding campaigns.
- Specify funding goals and campaign duration.
- Define project milestones.

### 2. Blockchain-Based Contributions
- Contributors can support campaigns using cryptocurrency.
- Contributions are recorded through smart contract transactions.
- Campaign funding information is retrieved from the blockchain.

### 3. Milestone-Based Fund Release
- Campaign creators submit proof for completed milestones.
- Eligible contributors vote on milestone submissions.
- Voting results are finalized after the voting period.
- Funds are released when the milestone satisfies the smart contract conditions.

### 4. Transparent Campaign Tracking
- View campaign information and funding progress.
- Track milestones and their approval status.
- View submitted milestone proof and voting information.

### 5. Role-Based Access
The application distinguishes between different user roles:

- **Campaign Owner:** Creates campaigns and manages milestone submissions.
- **Contributor:** Supports campaigns and participates in eligible milestone voting.
- **Owner-Contributor:** A campaign owner who has also contributed.
- **Visitor:** Views publicly available campaign information.

Voting eligibility is governed by the smart contract rules.

### 6. AI-Powered Trust Engine
- Predicts campaign success probability.
- Generates a campaign trust score.
- Provides recommendations based on campaign activity and progress.
- Uses live campaign information collected from the blockchain.

---

## How It Works

1. **Create a Campaign:** A campaign creator publishes a campaign with a funding goal and milestones.
2. **Contribute Funds:** Contributors support the campaign through blockchain transactions.
3. **Submit Milestone Proof:** The campaign creator submits evidence of completed milestone work.
4. **Vote on Milestones:** Eligible contributors vote on the submitted milestone.
5. **Finalize Voting:** Voting is finalized after the voting period.
6. **Release Funds:** Approved milestones can receive their allocated funds according to the smart contract.
7. **Analyze with AI:** The AI Trust Engine evaluates campaign information and provides insights.

---

## Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React, Vite, TypeScript |
| Styling | CSS |
| Blockchain | Solidity, Ethereum-compatible blockchain |
| Smart Contract Development | Hardhat |
| Blockchain Interaction | Viem |
| Wallet | MetaMask |
| AI / Machine Learning | Python, Scikit-learn |
| Machine Learning Model | Random Forest Classifier |
| Model Storage | Joblib |
| Backend | FastAPI |
| Data Validation | Pydantic |

---

## AI Trust Engine

FundChain AI integrates a machine learning component to analyze campaign performance.

### Machine Learning Model

The project uses a **Random Forest Classifier** trained using synthetic historical campaign data.

The model uses the following features:

- Campaign funding progress.
- Days remaining.
- Number of backers.
- Number of approved milestones.
- Whether the campaign creator has contributed.

### AI Outputs

**Success Probability**

An estimate of the campaign's likelihood of reaching its funding goal based on the model's input features.

**Trust Score**

A campaign assessment generated by the AI backend using campaign-related information.

**Recommendations**

Dynamic suggestions based on campaign conditions, such as funding progress, remaining time, and milestone activity.

### Backend API

The FastAPI backend exposes a prediction endpoint:

`POST /predict`

The frontend gathers campaign information from the blockchain and sends the relevant features to the AI backend.

**Note:** The current model is trained on synthetic data. Its predictions are experimental and should not be interpreted as independently verified fraud detection, financial advice, or a guarantee of campaign success.

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
```

---

## Getting Started

### Prerequisites

Install the following before running the project:

- Node.js and npm.
- Python 3.
- Git.
- MetaMask browser extension.

### 1. Clone the Repository

```bash
git clone https://github.com/Moulya287/FundChain-AI.git
```

```bash
cd FundChain-AI
```

### 2. Install Blockchain Dependencies

```bash
npm install
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### 4. Set Up the AI Backend

```bash
cd ai-backend
```

Create and activate a Python virtual environment.

**Windows:**

```bash
python -m venv venv
venv\Scripts\activate
```

Install the required Python packages:

```bash
pip install fastapi uvicorn scikit-learn pandas numpy joblib
```

Then return to the project root:

```bash
cd ..
```

---

## Running the Project

The application uses three main components that need to run.

### Terminal 1: Start the Local Blockchain

From the project root:

```bash
npx hardhat node
```

Keep this terminal running.

### Terminal 2: Compile and Deploy the Smart Contract

```bash
npx hardhat compile
```

```bash
npx hardhat run scripts/deploy.ts --network localhost
```

Use the deployed contract address in the frontend configuration before starting the application.

### Terminal 3: Start the Frontend

```bash
cd frontend
npm run dev
```

Open the local URL displayed by Vite in your browser.

### Terminal 4: Start the AI Backend

```bash
cd ai-backend
```

Activate your Python virtual environment if it is not already active.

Start the FastAPI server:

```bash
uvicorn train_and_serve:app --reload --port 8000
```

The AI backend should be available at:

`http://localhost:8000`

---

## Future Improvements

- Train the AI model using larger, real-world crowdfunding datasets.
- Improve model evaluation and prediction reliability.
- Introduce more advanced campaign verification mechanisms.
- Enhance milestone proof verification.
- Improve application security and smart contract testing.
- Explore deployment to a public blockchain network.

---

## Important Notes

- The current project is configured for local blockchain development.
- Local blockchain data is reset when the local Hardhat node is restarted.
- MetaMask must be configured to connect to the local development network.
- The frontend contract address must match the currently deployed smart contract.
- AI predictions depend on the model and the campaign information supplied to the backend.

---

## License

This project is currently available for educational and development purposes. A formal open-source license can be added when one is selected.
