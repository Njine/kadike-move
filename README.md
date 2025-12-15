# Kadike Move MVP

## Project Overview
Kadike Move is a real-time multiplayer card game platform built as a full-stack MVP. It features a Move 2 smart contract for escrow and micro-stakes, a NestJS backend for game logic and WebSocket communication, and a React + Vite + TailwindCSS frontend for a modern, responsive UI.

## MVP Game Rules
- **Players:** 2–4 per match
- **Private Hands:** Each player has a private hand, only visible to themselves
- **Niko Kadi:** Players can declare micro-stakes (Niko Kadi) during the match
- **Draw/Discard Reshuffle:** When the draw deck is empty, reshuffle the discard pile (except the top card) to continue play
- **Turns:** Players take turns drawing, discarding, and making moves
- **Move Verification:** All moves are hash-verified for fairness

## Technical Stack
- **Smart Contract:** Move 2 (MatchEscrow)
- **Backend:** NestJS (TypeScript, WebSocket Gateway)
- **Frontend:** React, Vite, TypeScript, TailwindCSS
- **Scripts:** Bash/Node.js utilities for deployment, dev, and simulation

## Gameplay Flow
1. Players join the lobby and are matched
2. Each player deposits their stake (escrowed on-chain)
3. The match starts, hands are dealt privately
4. Players take turns (draw, play, discard, declare Niko Kadi)
5. When the draw deck is empty, discard pile (except top) is reshuffled
6. Moves are hash-verified and recorded
7. Winner is determined, payout is settled via smart contract

## Repository Structure
- `frontend/` — React + Vite + TailwindCSS client
- `backend/` — NestJS server with game logic and WebSocket API
- `contracts/` — Move 2 smart contracts (MatchEscrow)
- `scripts/` — Utility scripts for deployment, dev, and simulation

## Checkpoint/Demo Submission Instructions
1. Ensure all code is committed and pushed to the `main` branch
2. Provide a link to the repository: https://github.com/Njine/kadike-move
3. Include a short demo video or screenshots of:
   - Players joining and playing a match
   - Niko Kadi micro-stakes in action
   - Smart contract escrow and payout
4. List any known issues or TODOs in this README

---

## Implementation & Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- npm (v9+ recommended)
- Move CLI (for Move 2 contract development)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/Njine/kadike-move.git
cd kadike-move
```

### 2. Install Dependencies
#### Frontend
```bash
cd frontend
npm install
```
#### Backend
```bash
cd ../backend
npm install
```
#### Contracts
```bash
cd ../contracts
# Install Move dependencies if needed (see Move documentation)
```
#### Scripts
```bash
cd ../scripts
# No install needed unless you add Node.js scripts with dependencies
```

### 3. Running the Project
#### Start the Backend (NestJS)
```bash
cd backend
npm run start:dev
```
#### Start the Frontend (Vite)
```bash
cd ../frontend
npm run dev
```

#### Utility Scripts
Scripts for deployment, running backend/frontend, and simulating games are in the `scripts/` folder. Example:
```bash
./scripts/deploy_move_contracts.sh
./scripts/run_backend.sh
./scripts/run_frontend.sh
./scripts/simulate_game.js
```

### 4. Environment Variables
- Backend and frontend may require environment variables for configuration (e.g., WebSocket URLs, contract addresses). See `.env.example` files if present, or check the code for required variables.

### 5. Linting & Formatting
Run linters and formatters before committing:
```bash
cd backend
npm run lint && npm run format
cd ../frontend
npm run lint && npm run format
```

---
For questions or contributions, open an issue or pull request on GitHub.
