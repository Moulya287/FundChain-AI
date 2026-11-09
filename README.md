# FundChain AI

### AI-Driven Smart Contract Oracle for Milestone-Based Crowdfunding

FundChain AI is a blockchain-based crowdfunding platform that combines smart contract escrow, AI-powered trust assessment, and cryptographically authenticated Oracle decisions to improve transparency and accountability in crowdfunding.

Unlike traditional crowdfunding platforms, where campaign creators may receive funds upfront, FundChain AI uses milestone-based escrow management. Campaign creators submit evidence of milestone completion, which is evaluated by an off-chain AI verification service. The AI generates an approval or rejection decision, which is cryptographically signed by the Oracle and verified by the Solidity smart contract before funds can be released.

The platform aims to make crowdfunding more transparent through automated milestone assessment, historical trust analysis, and blockchain-enforced fund management.

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Proposed Solution](#proposed-solution)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [AI Trust Engine](#ai-trust-engine)
- [Smart Contract Oracle](#smart-contract-oracle)
- [Fund Release Mechanism](#fund-release-mechanism)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Running the Project](#running-the-project)
- [Research Contributions](#research-contributions)
- [Future Enhancements](#future-enhancements)
- [Limitations](#limitations)

---

## Problem Statement

Traditional crowdfunding platforms face challenges related to transparency, accountability, and verification of fund utilisation.

Some major issues include:

- Campaign creators may receive collected funds without completing their promised objectives.
- Contributors may have limited visibility into how campaign funds are utilised.
- Manual milestone approval and voting mechanisms can be subjective and vulnerable to manipulation.
- Blockchain transactions provide financial transparency but cannot independently verify real-world activities.
- Existing campaign assessments may not adequately consider a creator's historical behaviour over time.

FundChain AI addresses these challenges by combining blockchain-based escrow management with AI-assisted milestone assessment and authenticated Oracle communication.

## Proposed Solution

FundChain AI introduces an AI-driven Smart Contract Oracle (SCO) mechanism for milestone-based crowdfunding.

The platform follows a structured workflow:

1. Campaign creators create campaigns with predefined funding goals and milestones.
2. Contributors deposit ETH into the campaign's smart contract escrow.
3. Campaign creators submit milestone completion proof.
4. An off-chain AI verification service analyses the submitted information and relevant campaign history.
5. The AI generates a trust assessment and an approval or rejection decision.
6. The Oracle cryptographically signs the decision and communicates it to the smart contract.
7. The smart contract verifies the Oracle signature and checks the milestone and escrow conditions.
8. Funds are released only when the required conditions are satisfied.

The proposed architecture separates AI assessment, Oracle authentication, and blockchain fund enforcement.

## Key Features

### 1. Decentralized Crowdfunding

- Create crowdfunding campaigns.
- Define funding goals and campaign durations.
- Specify milestones and their respective fund allocations.
- Allow contributors to support campaigns using ETH.

### 2. Smart Contract-Based Escrow

- Contributions are held by the Solidity smart contract.
- Funds are associated with predefined campaign milestones.
- Fund release is controlled by smart contract conditions.
- Approved milestone allocations can be transferred to campaign creators.

### 3. AI-Driven Milestone Assessment

- Evaluate submitted milestone proof.
- Validate proof text against milestone requirements.
- Perform invoice text consistency checks.
- Detect identical evidence submissions using SHA-256 hashing.
- Consider historical milestone outcomes and campaign activity.

### 4. Dynamic AI Trust Score

The Trust Engine evaluates campaign behaviour over time rather than relying only on a single snapshot.

Potential assessment parameters include:

- Previous milestone approval outcomes.
- Previous milestone rejection outcomes.
- Milestone completion delays.
- Evidence consistency.
- Campaign progress.
- Historical verification results.

The Trust Score is updated as new campaign events occur.

### 5. Cryptographically Authenticated Oracle

- AI decisions are signed using an Oracle private key.
- The signed message includes campaign and milestone identifiers.
- Evidence hashes bind the decision to the submitted evidence.
- Solidity verifies the signature before accepting the decision.
- Replay protection mechanisms help prevent reuse of old Oracle decisions.

### 6. Campaign Success Prediction

The platform also includes a separate machine learning model for estimating campaign success probability.

This prediction is informational and is distinct from the milestone approval mechanism.

---

## System Architecture

The system consists of four main components.

### 1. Frontend

The React application provides:

- Campaign creation and exploration.
- Wallet connectivity through MetaMask.
- ETH contribution functionality.
- Milestone proof submission.
- AI trust assessment display.
- Campaign progress and milestone tracking.

### 2. Blockchain Layer

The Solidity smart contract manages:

- Campaign creation.
- Contributor deposits.
- Escrow balances.
- Milestone allocations.
- Oracle authorization.
- Signature verification.
- Milestone approval and fund release.

### 3. Off-Chain AI Backend

The Python FastAPI backend handles:

- Milestone proof processing.
- Evidence consistency checks.
- SHA-256 evidence hashing.
- Historical campaign data analysis.
- Dynamic trust assessment.
- AI approval or rejection decisions.

### 4. Oracle Communication Layer

The Oracle:

- Receives the AI decision.
- Signs the structured decision payload.
- Sends the authenticated result to the smart contract.
- Enables the contract to verify the decision before executing the appropriate action.

---

## AI Trust Engine

FundChain AI separates campaign success prediction from milestone trust assessment.

### A. Campaign Success Prediction

The existing Random Forest Classifier is trained using 5,000 synthetic campaign records.

Its input features include:

- Funding progress.
- Days remaining.
- Number of backers.
- Approved milestones.
- Creator contribution.

The model produces a campaign success probability.

This output is intended to provide additional campaign insights and does not independently authorize milestone fund release.

### B. Dynamic Trust Assessment

The proposed temporal Trust Engine evaluates campaign reliability using historical information.

The assessment considers:

| Parameter | Purpose |
|---|---|
| Milestone approval history | Tracks successfully completed milestones |
| Rejection history | Tracks unsuccessful verification attempts |
| Submission delays | Evaluates milestone completion timeliness |
| Evidence consistency | Checks submitted information against requirements |
| Campaign activity | Evaluates campaign progress over time |

The Trust Score is updated as new milestone events and verification results are recorded.

### C. Evidence Consistency Checks

The current proposed mini-project approach includes:

**Proof Text Validation**

Checks whether submitted proof contains meaningful information and satisfies basic completeness requirements.

**Keyword Matching**

Compares proof text with the predefined milestone description.

**Invoice Text Consistency**

Extracts invoice text and compares relevant information, such as item descriptions and quantities, with milestone requirements.

**SHA-256 Evidence Hashing**

Generates a cryptographic hash of submitted evidence to identify identical files and bind Oracle decisions to specific evidence.

These checks assess evidence consistency and integrity. They do not independently establish that a real-world activity was completed.

---

## Smart Contract Oracle

The Smart Contract Oracle connects the off-chain AI verification service with the Solidity smart contract.

The Oracle uses cryptographic signing to authenticate AI decisions.

### Oracle Workflow

1. The creator submits milestone evidence.
2. The Python backend processes the submission.
3. The AI generates an approval or rejection decision.
4. The Oracle creates a structured decision message.
5. The message is signed using the Oracle's private key.
6. The signed message is submitted to the Solidity smart contract.
7. Solidity verifies the signature using the registered Oracle address.

### Cryptographic Technologies

- `eth-account` for Ethereum-compatible signing.
- `keccak256` for message hashing.
- `ecrecover` for signer recovery and verification.
- SHA-256 for evidence file hashing.

The signed decision should include relevant identifiers, evidence hash, decision, nonce, deadline, chain ID and contract address.

Signature verification authenticates the Oracle's message. It does not independently prove that the AI assessment or real-world evidence is correct.

---

## Fund Release Mechanism

Fund release is controlled through an AI-assisted Oracle decision and smart contract validation.

### Off-Chain Assessment

The AI verification service evaluates:

- Milestone proof completeness.
- Evidence consistency.
- Invoice information.
- Historical campaign trust.
- Previous milestone outcomes.
- Campaign activity.

The backend also obtains authoritative financial information from the blockchain to assess payout feasibility.

### On-Chain Enforcement

Before releasing funds, the smart contract must verify:

- The Oracle signature is valid.
- The decision corresponds to the correct campaign.
- The decision corresponds to the correct milestone.
- The evidence hash matches the signed evidence.
- The Oracle decision has not already been used.
- The signature has not expired.
- The milestone is eligible for release.
- Sufficient escrow funds are available.
- The requested amount does not exceed the milestone allocation.

If the authenticated decision is approved and all contract conditions pass, the milestone allocation can be released.

If the decision is rejected, the funds remain in escrow according to the contract's rejection and resubmission rules.

---

## Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React, Vite, TypeScript |
| Styling | CSS |
| Blockchain | Solidity, Ethereum-compatible blockchain |
| Smart Contract Development | Hardhat |
| Blockchain Interaction | Viem |
| Wallet Integration | MetaMask |
| AI / Machine Learning | Python, Scikit-learn |
| ML Model | Random Forest Classifier |
| AI Backend | FastAPI, Pydantic |
| Model Storage | Joblib |
| Cryptographic Signing | eth-account |
| Hashing | SHA-256, keccak256 |

---

## Project Structure

```text
FundChain-AI/
│
├── ai-backend/
│   ├── train_and_serve.py
│   ├── fundchain_model.joblib
│   └── requirements.txt
│
├── contracts/
│   └── FundChain.sol
│
├── scripts/
│   └── deploy.ts
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── pages/
│       ├── utils/
│       ├── App.tsx
│       ├── contract.ts
│       └── FundChainArtifact.json
│
├── test/
│
├── hardhat.config.ts
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

*Note: The structure above is illustrative. Update filenames to match the actual repository.*

---

## Getting Started

### Prerequisites

Install the following:

- Node.js and npm.
- Python 3.9 or later.
- Git.
- MetaMask browser extension.

### 1. Clone the Repository

```bash
git clone https://github.com/Moulya287/FundChain-AI.git
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

python -m venv venv
```

Activate the virtual environment.

**Windows:**

```bash
venv\Scripts\activate
```

**Mac/Linux:**

```bash
source venv/bin/activate
```

Install the backend dependencies:

```bash
pip install -r requirements.txt
```

If a `requirements.txt` file is not present, install the dependencies listed in the backend's actual imports and configuration.

---

## Running the Project

The application uses separate terminals for the blockchain, frontend and AI backend.

### Terminal 1: Start the Local Blockchain

From the project root:

```bash
npx hardhat node
```

Keep this terminal running.

### Terminal 2: Compile and Deploy the Smart Contract

```bash
npx hardhat compile
npx hardhat run scripts/deploy.ts --network localhost
```

Update the frontend contract address with the newly deployed address if required.

### Terminal 3: Start the Frontend

```bash
cd frontend
npm run dev
```

Open the local URL displayed by Vite.

### Terminal 4: Start the AI Backend

```bash
cd ai-backend
```

Activate the Python virtual environment, then run:

```bash
uvicorn train_and_serve:app --reload --port 8000
```

The backend should be available at:

`http://localhost:8000`

---

## Research Contributions

The proposed FundChain AI framework explores the integration of:

1. **Temporal Trust Assessment:** Evaluating campaign reliability using historical milestone behaviour rather than a single campaign snapshot.
2. **Evidence Consistency Analysis:** Applying hashing and structured text checks to improve evidence integrity and consistency.
3. **AI-Driven Oracle Decisions:** Using off-chain AI assessments to generate milestone approval or rejection decisions.
4. **Cryptographic Decision Authentication:** Binding signed Oracle decisions to specific campaign milestones and evidence.
5. **Automated Escrow Enforcement:** Using Solidity smart contracts to enforce authenticated decisions and milestone fund-release conditions.

These contributions should be evaluated against existing research to establish their novelty and effectiveness.

---

## Roadmap & Future Enhancements

### 1. Advanced Evidence Verification

**Current direction:**
- SHA-256 evidence hashing.
- Duplicate evidence detection.
- Basic proof text validation.
- Invoice text consistency checks.

**Future work:**
- Computer vision for image-content analysis.
- Vision-Language Models for milestone evidence assessment.
- Advanced OCR and document understanding.
- Detection of manipulated or inconsistent evidence.

### 2. Decentralized Oracle Network

**Current direction:**
- A Python-based Oracle service signs AI decisions.

**Future work:**
- Integrate decentralized Oracle networks.
- Introduce multiple independent verification nodes.
- Explore consensus-based Oracle decisions.
- Reduce dependence on a single Oracle operator.

### 3. Advanced Temporal Trust Modelling

**Current direction:**
- Historical milestone outcomes.
- Submission delays.
- Evidence consistency.
- Dynamic trust assessment.

**Future work:**
- Explore time-series machine learning models.
- Introduce explainable AI.
- Evaluate trust-score stability and reliability.
- Develop robust historical behaviour analysis.
## Future Enhancement: AI-Powered Milestone Proof Verification

### Vision

FundChain AI is designed to evolve beyond basic proof validation and trust scoring toward a more comprehensive, AI-driven milestone evidence verification framework.

The next proposed development phase focuses on evaluating whether submitted evidence is consistent with the actual requirements of a crowdfunding milestone.

### Proposed Capabilities

**1. Computer Vision-Based Evidence Analysis**
- Analyse photographs submitted by campaign creators.
- Detect relevant objects, equipment, and infrastructure using models such as YOLO.
- Compare detected visual elements with milestone requirements.

**2. OCR-Based Invoice and Document Verification**
- Extract information from invoices, receipts, and reports.
- Identify quantities, amounts, dates, and item descriptions.
- Compare extracted details with milestone requirements and other submitted evidence.

**3. NLP-Based Proof Validation**
- Analyse the meaning of submitted proof descriptions.
- Measure semantic similarity between milestone objectives and submitted explanations.
- Identify incomplete, irrelevant, or inconsistent descriptions.

**4. Duplicate and Suspicious Evidence Detection**
- Detect repeated evidence using cryptographic hashes.
- Explore image similarity techniques to identify visually similar submissions.
- Flag inconsistencies across multiple submissions.

**5. Multimodal AI Verification**
- Combine information from images, documents, and text.
- Evaluate consistency between different forms of evidence.
- Generate an explainable evidence assessment for the AI Trust Engine.

**6. Integration with the Temporal AI Trust Engine**
- Combine current evidence assessments with historical campaign behaviour.
- Update trust assessments as new milestone evidence becomes available.
- Use the resulting assessment to inform the AI Oracle's milestone approval or rejection decision.

### Proposed Verification Workflow

```text
Campaign Creator
       |
       v
Uploads Milestone Evidence
(Images / Invoices / Reports / Text)
       |
       v
AI-Based Evidence Verification
       |
       |-- Computer Vision
       |-- OCR
       |-- NLP
       |-- Duplicate Detection
       |-- Cross-Document Consistency
       |
       v
Temporal AI Trust Engine
       |
       v
AI Milestone Decision
       |
       v
Cryptographically Authenticated Oracle
       |
       v
Solidity Smart Contract
       |
       v
Escrow Fund Release
(Only if required checks pass)
```

### Research Direction

This enhancement aims to investigate how multimodal artificial intelligence, temporal trust assessment, and blockchain-based escrow can be integrated to improve the reliability and transparency of milestone-based crowdfunding.

### Limitations

AI-based evidence analysis cannot independently guarantee that submitted photographs or documents represent genuine real-world milestone completion. Future research may incorporate independent verification, authenticated IoT data, and external inspection mechanisms.

**Development Status:** Planned / Future Research and Implementation.### 4. Real-World Training Data

**Current direction:**
- Random Forest trained using synthetic campaign data.

**Future work:**
- Evaluate larger real-world crowdfunding datasets.
- Develop independently labelled milestone verification datasets.
- Compare multiple machine learning approaches.
- Measure false approval and false rejection rates.

### 5. Privacy-Preserving Evidence Verification

Explore Zero-Knowledge Proofs and privacy-preserving verification techniques to protect sensitive contributor and campaign information.

### 6. Public Blockchain Deployment

Explore deployment to a public test network such as Sepolia, followed by security testing and evaluation before any mainnet deployment.

---

## Limitations

- The current Random Forest success prediction model uses synthetic training data.
- SHA-256 hashing detects identical files and supports evidence integrity but does not verify the truthfulness of photographs or invoices.
- Keyword matching and invoice text checks cannot independently prove real-world milestone completion.
- A cryptographically signed Oracle message establishes the origin and integrity of a decision, not the correctness of the AI assessment.
- A single Oracle service introduces a central point of trust and potential failure.
- AI predictions can produce false approvals and false rejections.
- Further testing with independently labelled real-world evidence is necessary to evaluate reliability.

---

## License

This project is developed for educational and research purposes. A formal open-source license can be added when one is selected.
