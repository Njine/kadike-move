# E2E Testing Guide - Kadike Move

## Overview
This guide walks you through manual end-to-end testing of the Kadike Move multiplayer card game using browser tabs to simulate multiple players.

## Prerequisites
- Node.js installed
- Backend and frontend dependencies installed (`npm install` in both directories)

---

## 1. Start Backend Server

```bash
cd backend
npm run start:dev
```

**Expected Output:**
```
[Nest] INFO [NestFactory] Starting Nest application...
[Nest] INFO [SocketModule] SocketModule dependencies initialized
[Nest] INFO [RoutesResolver] GameGateway (WebSockets):
[Nest] INFO [NestApplication] Nest application successfully started
```

The backend will be running on `http://localhost:3000`

---

## 2. Start Frontend Dev Server

In a new terminal:

```bash
cd frontend
npm run dev
```

**Expected Output:**
```
VITE v7.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

The frontend will be running on `http://localhost:5173`

---

## 3. Simulate Multiple Players

### Option A: Using Browser Tabs (Recommended)

1. **Open Player 1** (Match Creator)
   - Open `http://localhost:5173` in Chrome/Firefox
   - Enter name: `Alice`
   - Select number of players: `3`
   - Click **Create Match**
   - **Copy the Match ID** displayed (e.g., `550e8400-e29b-41d4-a716-446655440000`)

2. **Open Player 2** (Browser Tab 2)
   - Open new tab: `http://localhost:5173`
   - Enter name: `Bob`
   - Paste the Match ID
   - Click **Join Match**

3. **Open Player 3** (Browser Tab 3)
   - Open new tab: `http://localhost:5173`
   - Enter name: `Charlie`
   - Paste the Match ID
   - Click **Join Match**

### Option B: Using Incognito/Different Browsers

- Use regular tab + incognito tab + different browser for cleaner session isolation
- Follow same steps as Option A

---

## 4. Expected Game Flow

### Phase 1: Lobby & Match Creation

**Player 1 (Alice):**
- ✅ Creates match, sees "Waiting for players to join..."
- ✅ Match ID displayed to share with others

**Players 2 & 3 (Bob, Charlie):**
- ✅ Join using Match ID
- ✅ See waiting state

**Backend Console:**
```
[BLOCKCHAIN MOCK] Depositing stake for player Alice: 100 tokens
[BLOCKCHAIN MOCK] Depositing stake for player Bob: 100 tokens
[BLOCKCHAIN MOCK] Depositing stake for player Charlie: 100 tokens
```

### Phase 2: Game Start

**All Players:**
- ✅ Lobby disappears
- ✅ Match Board appears showing:
  - Pool: `300 tokens` (3 players × 100)
  - Top Card: First card from discard pile
  - Current Turn: Player name with ⭐
  - Players list with card counts (7 cards each)
  - Your hand (7 cards)

**Backend Console:**
```
Game started - Match: <match-id>
```

### Phase 3: Playing Cards

**Current Turn Player:**
1. Click a card from your hand that matches the top card's **suit OR rank**
2. ✅ Card disappears from your hand
3. ✅ Card appears as new top card
4. ✅ Turn indicator moves to next player
5. ✅ All players see updated state

**Invalid Move Test:**
- Try clicking a card when it's not your turn → Alert: "Not your turn!"
- Try clicking a card that doesn't match → Backend error in console

**Backend Console:**
```
Player Alice played: 7 of hearts
Turn changed to: Bob
```

### Phase 4: Drawing Cards

**Current Turn Player:**
1. Click **Draw Card** button
2. ✅ New card appears in your hand
3. ✅ Deck count decreases by 1
4. ✅ Turn stays with you (no automatic pass)

**Backend Console:**
```
Player Bob drew a card
Draw deck: 31 cards remaining
```

### Phase 5: Niko Kadi Declaration

**When a Player Has 1 Card:**
1. ✅ **Declare Niko Kadi** button becomes enabled (green)
2. Click the button
3. ✅ Pool increases by 10 tokens
4. ✅ "NIKO KADI!" badge appears next to player name
5. ✅ All players see the notification

**Backend Console:**
```
[BLOCKCHAIN MOCK] Recording Niko Kadi - Player: Charlie, Stake: 10 tokens
Player Charlie declared Niko Kadi!
Pool updated: 310 tokens
```

**Fail to Declare:**
- If player with 1 card doesn't click before going out → They can still win, just no extra stake

### Phase 6: Winning

**When a Player Plays Their Last Card:**
1. ✅ Game Over screen appears for all players
2. ✅ Winner sees: "🎉 You Win! 🎉"
3. ✅ Losers see: "Game Over" + winner name
4. ✅ Final pool amount displayed
5. ✅ **Play Again** button visible

**Backend Console:**
```
[BLOCKCHAIN MOCK] Settling match - Winner: Alice, Prize Pool: 310 tokens
Game Over - Winner: Alice
Match settled, prize distributed
```

---

## 5. Blockchain Integration Verification

Throughout the game, watch the backend console for blockchain mock calls:

### On Match Creation:
```
[BLOCKCHAIN MOCK] Depositing stake for player <id>: 100 tokens
TODO: Implement Movement SDK call to MatchEscrow::deposit_stake
```

### On Niko Kadi Declaration:
```
[BLOCKCHAIN MOCK] Recording Niko Kadi - Player: <id>, Stake: 10 tokens
TODO: Implement Movement SDK call to MatchEscrow::declare_niko_kadi
```

### On Game Win:
```
[BLOCKCHAIN MOCK] Settling match - Winner: <id>, Prize Pool: <amount> tokens
TODO: Implement Movement SDK call to MatchEscrow::settle_match
```

---

## 6. Edge Cases to Test

### Test 1: Invalid Card Play
- Player tries to play card that doesn't match suit/rank
- ✅ Backend rejects with error message
- ✅ No state change occurs

### Test 2: Playing Out of Turn
- Player clicks card when it's not their turn
- ✅ Frontend alert: "Not your turn!"
- ✅ No socket emission

### Test 3: Empty Deck Reshuffle
- Play until draw deck is empty
- Next draw action should trigger reshuffle
- ✅ Discard pile (except top card) becomes draw deck
- ✅ Game continues normally

### Test 4: Concurrent Niko Kadi
- Two players both reach 1 card
- Both click Niko Kadi button
- ✅ Pool increases by 10 for each
- ✅ Both players get badges

### Test 5: Player Disconnect (Manual)
- Close one browser tab mid-game
- ✅ Other players see "Disconnected" status
- ✅ Game continues (MVP: no auto-forfeit)

---

## 7. Success Criteria Checklist

- [ ] Match creation works with 2-4 players
- [ ] All players receive initial 7 cards
- [ ] Pool initializes correctly (players × 100)
- [ ] Turn indicator rotates correctly
- [ ] Valid cards can be played
- [ ] Invalid moves are rejected
- [ ] Draw card works and respects turn order
- [ ] Deck reshuffles when empty
- [ ] Niko Kadi declaration adds 10 to pool
- [ ] Winner detection triggers game over
- [ ] Blockchain mock logs appear at correct times
- [ ] All players see synchronized state
- [ ] Play Again reloads the page

---

## 8. Debugging Tips

### Frontend Not Connecting:
```bash
# Check Socket.IO connection in browser console
# Should see: "Socket.IO connected: <socket-id>"
```

### Backend Not Responding:
```bash
# Check NestJS logs for errors
# Verify port 3000 is not in use
lsof -i :3000
```

### State Desync Between Players:
- Check browser console for socket events
- Verify all players are in the same match room
- Look for error events in Socket.IO logs

### Cards Not Appearing:
- Check if hand state is being received via `private` event
- Verify `handUpdate` payload in browser DevTools (Network → WS tab)

---

## 9. Clean Up

```bash
# Stop backend: Ctrl+C in terminal
# Stop frontend: Ctrl+C in terminal
# Close all browser tabs
```

---

## Next Steps

After manual testing succeeds:
1. Write automated E2E test script (Task 13)
2. Test edge cases systematically (Task 14)
3. Document findings and create demo (Task 15)

---

**Happy Testing! 🎮**
