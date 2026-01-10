# Kadike Move - Multiplayer Card Game on Movement Blockchain

> A real-time multiplayer card game with on-chain stake deposits, micropayment mechanics, and gas-sponsored UX powered by Movement blockchain.

[![Movement](https://img.shields.io/badge/Movement-Testnet-blue)](https://movementlabs.xyz/)
[![Aptos SDK](https://img.shields.io/badge/Aptos_SDK-v1.0-green)](https://github.com/aptos-labs/aptos-ts-sdk)
[![WebSocket](https://img.shields.io/badge/Socket.IO-Real--time-orange)](https://socket.io/)

---

## What is Kadike Move?

**Kadike** is a traditional East African card game similar to UNO - players must match suit or rank to play cards, with the first to empty their hand winning. This implementation brings Kadike on-chain with:

- **Economic Stakes**: Players deposit 100 KADI tokens to enter matches
- **Niko Kadi Mechanic**: Optional micropayment (10 KADI) to declare when down to 1 card
- **Gas Sponsorship**: All blockchain transactions paid by platform relayer
- **Prize Pool**: Winner receives pool minus 3.5% platform fee
- **Real-time Multiplayer**: WebSocket-powered gameplay for 2-4 players

---

## Why Movement?

Movement blockchain is the **perfect fit** for Kadike because:

### 1. Gas Sponsorship = Seamless UX
Traditional blockchain games force users to manage gas fees for every action. Movement's architecture allows us to sponsor all transactions via a relayer account, creating a **Web2-like experience** while maintaining Web3 ownership.

```typescript
// Platform pays gas - users just play
await blockchainService.depositStake(playerId, 100);  // Relayer signs
await blockchainService.recordNikoKadi(playerId, 10); // Relayer signs
await blockchainService.settleMatch(winnerId);        // Relayer signs
```

### 2. Move Language = Safe Smart Contracts
The Move programming language provides **resource safety** guarantees critical for handling player funds:
- No double-spending of stakes
- Type-safe escrow handling
- Event emission for audit trails

### 3. High-Performance Gaming
Movement's optimized execution enables **low-latency** transaction finality needed for competitive multiplayer gaming.

---

## Why x402?

The **Niko Kadi** mechanic demonstrates x402 micropayment authorization:

### Traditional Problem
Requiring blockchain approval for every 10 KADI payment would:
- Interrupt gameplay flow
- Require wallet pop-ups mid-game
- Create terrible UX

### x402 Solution (Planned Integration)
Players **pre-authorize** a spending limit when joining:
```
"Allow Kadike game to spend up to 50 KADI during this match"
```

Then Niko Kadi declarations happen **instantly** without approval prompts:
- Real-time gameplay maintained
- User stays in control (capped spending)
- Platform can't over-charge

**Current Status**: Mocked in code with clear integration points (see `game-engine.service.ts` lines 300-330)

---

## KADI Economy Explained

### Entry Stakes (On-Chain)
- Each player deposits **100 KADI** when match is created
- Stored in `MatchEscrow` smart contract
- Cannot be withdrawn until match settles

### Niko Kadi Micropayment (x402)
- **Optional** mechanic when player has 1 card left
- Costs **10 KADI** from player's wallet (separate from stake)
- Adds to prize pool
- Prevents opponents from calling "Kadi" penalty

### Settlement & Fees
```
Final Pool = (100 * num_players) + Niko Kadi declarations
Platform Fee = floor(Final Pool * 3.5%)
Winner Payout = Final Pool - Platform Fee
```

**Example (3 players, 1 Niko Kadi):**
```
Entry Stakes:    3 × 100 = 300 KADI
Niko Kadi:       1 × 10  =  10 KADI
────────────────────────────────────
Final Pool:               310 KADI
Platform Fee:    310 × 3.5% = 10 KADI (rounded down)
Winner Receives:          300 KADI
```

---

## Architecture

### On-Chain (Movement)
```
contracts/MatchEscrow.move
├── deposit_stake()      → Lock player entry stakes
├── declare_niko_kadi()  → Record micropayment
└── settle_match()       → Distribute winner payout
```

### Off-Chain (Backend)
```
backend/src/
├── game-engine.service.ts     → Game rules & state machine
├── game.gateway.ts            → WebSocket event handlers
└── blockchain/
    └── blockchain.service.ts  → Movement SDK integration
```

### Frontend (React + Socket.IO)
```
frontend/src/components/
├── Lobby.tsx          → Match creation/join
├── MatchBoard.tsx     → Pool, players, deck info
├── Hand.tsx           → Player cards & actions
└── MatchSummary.tsx   → Settlement breakdown
```

### Data Flow
```
Player Action → WebSocket → Game Engine → Blockchain Service → Movement
                                ↓
                          State Update
                                ↓
                          WebSocket Broadcast → All Clients
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Blockchain** | Movement (Aptos-based), Move language |
| **Backend** | NestJS, TypeScript, Socket.IO |
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS |
| **Smart Contracts** | Move 2 |
| **SDK** | Aptos TS SDK (@aptos-labs/ts-sdk) |
| **Real-time** | WebSocket (Socket.IO) |

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Movement testnet access (optional for demo mode)

### 1. Clone & Install
```bash
git clone https://github.com/Njine/kadike-move.git
cd kadike-move

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment (Optional)
```bash
cd backend
cp .env.example .env
# Edit .env with your Movement credentials (or use DEMO MODE)
```

**DEMO MODE** runs without blockchain credentials - logs show "would submit transaction" messages.

### 3. Start Backend
```bash
cd backend
npm run start
# Backend runs on http://localhost:3000
```

You should see:
```
[BLOCKCHAIN] Movement integration initialized
Backend running on http://localhost:3000
```

### 4. Start Frontend
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

### 5. Play a Match
1. **Player 1**: Open `http://localhost:5173`, enter name, select 3 players, click **Create Match**
2. **Copy Match ID** displayed on screen
3. **Player 2**: Open new tab, enter name, paste Match ID, click **Join Match**
4. **Player 3**: Repeat for third player
5. **Game auto-starts** when all players join

**Watch backend console** for blockchain transaction logs.

---

## Game Rules

### Objective
First player to empty their hand wins the prize pool.

### Gameplay
1. Match suit OR rank of the top discard pile card
2. If no valid card, draw from deck
3. Deck reshuffles when empty (using discard pile)
4. Turn advances automatically

### Niko Kadi Declaration
- When you have **exactly 1 card left**
- **Optional** - costs 10 KADI from wallet
- Prevents opponents from forcing you to draw penalty cards
- Adds 10 KADI to prize pool

### Winning
- First to play all cards wins immediately
- Settlement occurs on-chain (or logged in demo mode)
- Winner receives pool minus 3.5% platform fee

---

## Smart Contract Details

### MatchEscrow.move

**Module Structure:**
```move
module Move2 {
    struct Escrow has key {
        stakes: table::Table<vector<u8>, u64>,
        total: u64,
        event_handle_stake: event::EventHandle<StakeEvent>,
        event_handle_niko: event::EventHandle<NikoKadiEvent>,
        event_handle_payout: event::EventHandle<WinnerPayoutEvent>,
    }
```

**Key Functions:**
- `deposit_stake(player_id, amount)` - Lock entry stake
- `declare_niko_kadi(player_id, amount)` - Record micropayment
- `settle_match(winner_id)` - Distribute prize pool

**Events Emitted:**
- `StakeEvent` - Player deposited entry stake
- `NikoKadiEvent` - Player declared Niko Kadi
- `WinnerPayoutEvent` - Winner received payout

---

## Key Implementation Highlights

### 1. Server-Authoritative Game Engine
All game logic runs on backend to prevent cheating:
```typescript
// Backend validates every move
if (!this.isValidPlay(card, match.discardPile[0])) {
  throw new Error('Invalid card play');
}
```

### 2. Gas Sponsorship via Relayer
```typescript
const relayerAccount = Account.fromPrivateKey({ privateKey });
const txn = await aptos.transaction.build.simple({
  sender: relayerAccount.accountAddress,  // Platform pays
  data: { 
    function: `${escrowAddress}::Move2::deposit_stake`,
    functionArguments: [playerIdBytes, amount]
  }
});
```

### 3. Real-time State Sync
```typescript
// Broadcast to all players in match
server.to(matchId).emit('public', {
  type: 'matchUpdate',
  match: sanitizedMatch
});

// Private data to individual player
socket.emit('private', {
  type: 'handUpdate',
  hand: player.hand
});
```

### 4. Wallet Balance Tracking
UI shows real-time KADI balance:
```typescript
interface Player {
  id: string;
  name: string;
  walletBalance: number;  // Tracks available KADI for Niko Kadi
  hand: Card[];
}
```

---

## Project Structure

```
kadike-move/
├── backend/
│   ├── src/
│   │   ├── blockchain/
│   │   │   └── blockchain.service.ts    # Movement SDK integration
│   │   ├── game-engine.service.ts       # Core game logic
│   │   ├── game.gateway.ts              # WebSocket handlers
│   │   ├── types/game.ts                # Shared type definitions
│   │   └── main.ts                      # NestJS bootstrap
│   ├── .env.example                     # Environment template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── GameRoom.tsx             # Main game container
│   │   │   ├── Lobby.tsx                # Match creation/join
│   │   │   ├── MatchBoard.tsx           # Game state display
│   │   │   ├── Hand.tsx                 # Player cards & actions
│   │   │   └── MatchSummary.tsx         # Settlement screen
│   │   ├── utils/websocket.ts           # Socket.IO client
│   │   └── types/game.ts                # Shared type definitions
│   └── package.json
│
├── contracts/
│   └── MatchEscrow.move                 # Smart contract
│
├── scripts/
│   └── e2e-test.md                      # Manual testing guide
│
└── README.md                            # This file
```

---

## Roadmap

### Completed (Hackathon MVP)
- [x] Core game engine with all Kadike rules
- [x] Real-time multiplayer via WebSocket
- [x] KADI economic model (stakes, Niko Kadi, fees)
- [x] Movement blockchain integration (Aptos SDK)
- [x] Gas sponsorship architecture
- [x] UI showing wallet balances and settlement breakdown
- [x] Demo mode for testing without deployed contract

### Next Steps (Post-Hackathon)
- [ ] Deploy MatchEscrow.move to Movement testnet
- [ ] Integrate real x402 authorization for Niko Kadi
- [ ] Implement KADI token contract (fungible asset)
- [ ] Add matchmaking queue system
- [ ] Leaderboard and player statistics
- [ ] Mobile-responsive UI
- [ ] Automated E2E tests
- [ ] Production deployment

### Future Enhancements
- [ ] Tournament mode with bracket system
- [ ] NFT card skins and customization
- [ ] Spectator mode for matches
- [ ] Replay system with on-chain verification
- [ ] DAO governance for rule changes
- [ ] Cross-chain bridge for KADI token

---

## Testing

### Manual E2E Testing
Follow the detailed guide in [`scripts/e2e-test.md`](scripts/e2e-test.md):
1. Start backend and frontend
2. Open 2-3 browser tabs
3. Create match in tab 1
4. Join with other tabs using Match ID
5. Play through full game flow
6. Verify blockchain logs in backend console

---

## License

MIT License - see [LICENSE](LICENSE) file for details

---

## Acknowledgments

- **Movement Labs** - For the blockchain platform and gas sponsorship capabilities
- **Aptos Foundation** - For the robust Move language and TypeScript SDK
- **NestJS Team** - For the excellent backend framework
- **Socket.IO** - For making real-time multiplayer development straightforward
- **East African Gaming Culture** - For the original Kadike card game

---

## Contact

**Developer**: Njine  
**GitHub**: [@Njine](https://github.com/Njine)  
**Project**: [kadike-move](https://github.com/Njine/kadike-move)

---

## Hackathon Context

**Built for**: Movement Hackathon  
**Category**: Gaming / DeFi  
**Focus**: Demonstrating gas sponsorship, micropayments (x402), and Move smart contracts in a real-world multiplayer game

**Key Innovation**: Seamless Web2 UX with Web3 ownership - players never see gas fees or transaction approvals during gameplay, while maintaining full on-chain transparency for stakes and settlements.

---

**Play Fair. Play On-Chain. Play Kadike.**
