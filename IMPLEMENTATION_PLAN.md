# Kadike Move - Implementation Plan

## Project Overview
Multiplayer card game MVP with NestJS backend, React frontend, and Move 2 smart contracts for escrow/micro-stakes.

**Constraints:**
- Hackathon MVP - no over-engineering
- Backend is sole authority for game state
- No ZK proofs, no client-side verification
- Native WebSocket (Socket.IO only if needed)
- Blockchain calls mocked initially

---

## Canonical Type System

**Location:** `backend/src/types/game.ts`

```typescript
Card: { suit: string, rank: string }
Player: { id, name, hand: Card[], stake, nikoKadiDeclared, isConnected }
Match: { id, players, drawDeck, discardPile, topDiscardCard, turnIndex, pool, isActive, winnerId }
MoveHistory: { moveIndex, playerId, action, cardPlayed?, timestamp, hash }
```

**Rules:**
- All game types ONLY in `backend/src/types/game.ts`
- No duplicate interfaces anywhere
- Move history stored separately in `Map<matchId, MoveHistory[]>`

---

## ✅ Step 1: Core Game Engine (COMPLETED)

**File:** `backend/src/game-engine.service.ts`

**Implemented methods:**
- `createMatch(playerIds)` - Validates 2-4 players, initializes match
- `dealHands(matchId)` - Deals 7 cards to each player, flips one to start discard
- `playCard(matchId, playerId, card)` - Validates turn, card legality (suit OR rank match), checks win
- `drawCard(matchId, playerId)` - Auto-reshuffles discard when draw deck empty
- `reshuffleDiscard(matchId)` - Keeps top card, shuffles rest back into draw deck
- `declareNikoKadi(matchId, playerId)` - Validates 1 card, adds 10 tokens to pool immediately
- `recordMove()` - Generates SHA-256 hash with monotonic moveIndex (no timestamp in hash)
- `getMatch()`, `getMoveHistory()`, `getMatchById()` - Utility methods

**Key features:**
- Turn validation with clear error messages
- Card ownership and legality checks
- Win condition detection (empty hand)
- Move hashing: `SHA-256({matchId, moveIndex, playerId, action, cardPlayed?})`
- Fisher-Yates shuffle for deck randomization

---

## 🔌 Step 2: WebSocket Gateway (NEXT)

**File:** `backend/src/game.gateway.ts`

**Handlers to implement:**
1. `@SubscribeMessage('joinMatch')` - Add player to match room
2. `@SubscribeMessage('dealHands')` - Start the game
3. `@SubscribeMessage('playCard')` - Player plays a card
4. `@SubscribeMessage('drawCard')` - Player draws a card
5. `@SubscribeMessage('declareNikoKadi')` - Player declares Niko Kadi

**Outbound messages (2 types only):**
- `private` → `{type: 'private', hand: Card[]}` - Send to individual client
- `public` → `{type: 'public', match: Match}` - Broadcast to all (hands hidden)

**Logic:**
- Use `sanitizeMatchForPublic(match)` helper to hide all player hands
- After each action, emit `private` to affected player(s) and `public` to all
- Store client-to-player mapping for private messages
- Use Socket.IO rooms for match isolation

**Connection management:**
- Track connected clients
- Handle disconnection (mark player as disconnected)
- Validate player is in match before accepting moves

---

## 🎮 Step 3: Frontend Integration

**Files:** `frontend/src/components/*`, `frontend/src/utils/websocket.ts`

**Tasks:**
1. Update `websocket.ts` to use Socket.IO client (currently uses native WebSocket)
2. Implement `Lobby.tsx`:
   - Player name input
   - "Create Match" / "Join Match" buttons
   - Display waiting players
3. Implement `Hand.tsx`:
   - Display player's cards from `private` message
   - Click handlers to play cards
   - "Draw Card" button
   - "Declare Niko Kadi" button (when hand.length === 1)
4. Implement `MatchBoard.tsx`:
   - Display topDiscardCard
   - Show current turn indicator
   - Display all players and hand sizes
   - Show pool amount
   - Display Niko Kadi declarations
5. Implement `MatchSummary.tsx`:
   - Show winner
   - Display final pool
   - "Play Again" button
6. State management:
   - Use React hooks to store match state from `public` messages
   - Store player's hand from `private` messages
   - Update UI on every WebSocket event

**WebSocket flow:**
```
Client → joinMatch → Server
Server → private (initial hand if game started)
Server → public (match state)

Client → playCard → Server
Server → private (updated hand to player)
Server → public (updated match state to all)
```

---

## ⛓️ Step 4: Smart Contract Integration

**File:** `contracts/MatchEscrow.move`

**Already exists:**
- `deposit_stake(playerId, amount)` - Escrow player stakes
- `declare_niko_kadi(playerId, amount)` - Add micro-stake
- `settle_match(winnerId)` - Trigger payout

**Backend integration (new service):**
1. Create `backend/src/blockchain/blockchain.service.ts`
2. Mock implementation first:
   ```typescript
   async depositStake(matchId, playerId, amount) {
     console.log(`[MOCK] Depositing ${amount} for ${playerId} in match ${matchId}`);
     // TODO: Actual Move SDK call
   }
   
   async settleMatch(matchId, winnerId, pool) {
     console.log(`[MOCK] Settling match ${matchId}, winner: ${winnerId}, pool: ${pool}`);
     // TODO: Actual Move SDK call
   }
   ```
3. Call in `GameEngineService`:
   - On `createMatch()` → call `depositStake()` for each player
   - On `playCard()` when win detected → call `settleMatch()`
   - Optional: submit `getMoveHistory()` hashes on settlement

**Real implementation (after MVP works):**
- Install Movement SDK: `npm install @movement-sdk/client` (TBD - check docs)
- Configure relayer account (private key in .env)
- Sign and submit transactions
- Handle transaction errors/retries

---

## ⛽ Step 5: Gas Sponsorship Logic

**File:** `backend/src/blockchain/relayer.service.ts`

**Tasks:**
1. Load relayer private key from environment
2. Sign transactions on behalf of players
3. Pay gas fees from relayer account
4. Track sponsored transactions (log for MVP, DB for production)
5. Add rate limiting per player (prevent abuse)

**Implementation:**
```typescript
class RelayerService {
  private relayerAccount: Account;
  
  async sponsorTransaction(playerAction: PlayerAction) {
    // Validate action
    // Sign with relayer account
    // Submit transaction
    // Log gas cost
    return txHash;
  }
}
```

**Security considerations (post-MVP):**
- Rate limit: max N transactions per player per hour
- Gas budget: max gas per transaction
- Whitelist allowed contract functions
- Monitor relayer account balance

---

## Current Status

**Branch:** `feature/game-engine-core`

**Completed:**
- ✅ Canonical type system
- ✅ Core game engine with all methods
- ✅ Move history with hashing
- ✅ Build passing, no errors
- ✅ Git setup with proper .gitignore

**Next up:**
- 🔌 WebSocket gateway implementation
- 🎮 Frontend integration
- ⛓️ Smart contract calls (mocked)
- ⛽ Gas sponsorship

---

## Development Commands

```bash
# Backend
cd backend
npm install
npm run build
npm run start:dev

# Frontend
cd frontend
npm install
npm run dev

# Build all
npm run build  # (from root, if script exists)

# Deploy contracts (when ready)
./scripts/deploy_move_contracts.sh
```

---

## Notes

- **Niko Kadi**: Adds 10 tokens to pool immediately (no pending state)
- **Card legality**: Must match suit OR rank of topDiscardCard
- **Initial hands**: 7 cards per player
- **Reshuffle**: Keep top discard card, shuffle rest back into draw deck
- **Win condition**: First player to empty hand wins entire pool
- **Move history**: Hash does NOT include timestamp (only matchId, moveIndex, playerId, action, cardPlayed)

---

## Future Enhancements (Post-MVP)

- Database persistence (PostgreSQL/MongoDB)
- Player authentication (JWT/OAuth)
- Match history and leaderboards
- Spectator mode
- Multiple concurrent matches
- AI opponents for testing
- Mobile responsive UI
- Sound effects and animations
- Tournament mode
- Real-time analytics dashboard
