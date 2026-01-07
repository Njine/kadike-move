import { Injectable } from '@nestjs/common';
import type { Match, Player, Card, MoveHistory } from './types/game';
import * as crypto from 'crypto';
import { BlockchainService } from './blockchain/blockchain.service';

/**
 * Economic constants
 * Fixed for MVP; can be made configurable in future versions
 */
const MATCH_ENTRY_STAKE = 100; // KADI tokens per player
const NIKO_KADI_PENALTY = 10; // KADI tokens (from player wallet, not stake)

@Injectable()
export class GameEngineService {
  private matches: Map<string, Match> = new Map();
  private moveHistories: Map<string, MoveHistory[]> = new Map();

  constructor(private readonly blockchainService: BlockchainService) {}

  /**
   * Create a new match with the specified player IDs.
   * Players are initialized with empty hands. Deck is shuffled.
   * Match is created but not yet active (call dealHands to start).
   */
  createMatch(playerIds: string[]): Match {
    if (playerIds.length < 2 || playerIds.length > 4) {
      throw new Error('Match requires 2-4 players');
    }

    const id = crypto.randomUUID();
    const deck = this.generateDeck();

    const players: Player[] = playerIds.map((playerId) => ({
      id: playerId,
      name: `Player ${playerId}`,
      hand: [],
      stake: MATCH_ENTRY_STAKE, // Entry stake (locked, never modified)
      walletBalance: 1000, // Mock wallet balance for MVP (TODO: fetch from blockchain/user service)
      nikoKadiDeclared: false,
      isConnected: true,
    }));

    // Deposit stakes to blockchain escrow
    for (const player of players) {
      void this.blockchainService.depositStake(player.id, MATCH_ENTRY_STAKE);
    }

    const match: Match = {
      id,
      players,
      drawDeck: deck,
      discardPile: [],
      topDiscardCard: null,
      turnIndex: 0,
      pool: players.length * MATCH_ENTRY_STAKE, // Base pool from entry stakes
      isActive: false,
      winnerId: undefined,
    };

    this.matches.set(id, match);
    this.moveHistories.set(id, []);
    return match;
  }

  /**
   * Deal initial hands to all players (7 cards each).
   * Flip one card to start the discard pile.
   * Set match as active.
   */
  dealHands(matchId: string): Match {
    const match = this.getMatch(matchId);

    if (match.isActive) {
      throw new Error('Match has already started');
    }

    // Deal 7 cards to each player
    for (const player of match.players) {
      for (let i = 0; i < 7; i++) {
        if (match.drawDeck.length === 0) {
          throw new Error('Not enough cards in deck to deal hands');
        }
        const card = match.drawDeck.pop()!;
        player.hand.push(card);
      }
    }

    // Flip one card to start discard pile
    if (match.drawDeck.length === 0) {
      throw new Error('Not enough cards to start discard pile');
    }
    const startCard = match.drawDeck.pop()!;
    match.discardPile.push(startCard);
    match.topDiscardCard = startCard;
    match.isActive = true;

    return match;
  }

  /**
   * Play a card from player's hand to the discard pile.
   * Validates: turn order, card ownership, card legality (suit or rank match).
   * Checks for win condition (empty hand).
   * Records move in history with hash.
   */
  playCard(matchId: string, playerId: string, card: Card): Match {
    const match = this.getMatch(matchId);

    if (!match.isActive) {
      throw new Error('Match is not active');
    }

    if (match.winnerId) {
      throw new Error('Match has already ended');
    }

    // Validate turn
    const currentPlayer = match.players[match.turnIndex];
    if (currentPlayer.id !== playerId) {
      throw new Error(
        `Not your turn. Current turn: ${currentPlayer.id}, attempted: ${playerId}`,
      );
    }

    // Find card in player's hand
    const cardIndex = currentPlayer.hand.findIndex(
      (c) => c.suit === card.suit && c.rank === card.rank,
    );
    if (cardIndex === -1) {
      throw new Error(
        `Card ${card.rank} of ${card.suit} not found in player's hand`,
      );
    }

    // Validate card legality (must match suit OR rank)
    if (match.topDiscardCard) {
      const isLegal =
        card.suit === match.topDiscardCard.suit ||
        card.rank === match.topDiscardCard.rank;
      if (!isLegal) {
        throw new Error(
          `Illegal move: ${card.rank} of ${card.suit} does not match ${match.topDiscardCard.rank} of ${match.topDiscardCard.suit}`,
        );
      }
    }

    // Remove card from hand and add to discard pile
    currentPlayer.hand.splice(cardIndex, 1);
    match.discardPile.push(card);
    match.topDiscardCard = card;

    // Record move in history
    this.recordMove(matchId, playerId, 'play', card);

    // Check win condition
    if (currentPlayer.hand.length === 0) {
      match.isActive = false;
      match.winnerId = playerId;

      // Settle match on blockchain
      void this.blockchainService.settleMatch(playerId, match.pool);

      return match;
    }

    // Advance turn
    match.turnIndex = (match.turnIndex + 1) % match.players.length;

    return match;
  }

  /**
   * Draw a card from the draw deck and add to player's hand.
   * If draw deck is empty, reshuffle discard pile (except top card).
   * Validates turn order.
   */
  drawCard(matchId: string, playerId: string): Match {
    const match = this.getMatch(matchId);

    if (!match.isActive) {
      throw new Error('Match is not active');
    }

    if (match.winnerId) {
      throw new Error('Match has already ended');
    }

    // Validate turn
    const currentPlayer = match.players[match.turnIndex];
    if (currentPlayer.id !== playerId) {
      throw new Error(
        `Not your turn. Current turn: ${currentPlayer.id}, attempted: ${playerId}`,
      );
    }

    // If draw deck is empty, reshuffle discard pile
    if (match.drawDeck.length === 0) {
      this.reshuffleDiscard(matchId);
    }

    // Draw card
    if (match.drawDeck.length === 0) {
      throw new Error('No cards left to draw (deck and discard both empty)');
    }

    const card = match.drawDeck.pop()!;
    currentPlayer.hand.push(card);

    // If player had declared Niko Kadi and now has more than 1 card, reset the declaration
    if (currentPlayer.nikoKadiDeclared && currentPlayer.hand.length > 1) {
      currentPlayer.nikoKadiDeclared = false;
    }

    // Record move in history
    this.recordMove(matchId, playerId, 'draw', card);

    // Advance turn - player's turn ends after drawing
    match.turnIndex = (match.turnIndex + 1) % match.players.length;

    return match;
  }

  /**
   * Reshuffle discard pile (except top card) back into draw deck.
   * Keeps the top discard card in place.
   */
  reshuffleDiscard(matchId: string): Match {
    const match = this.getMatch(matchId);

    if (match.discardPile.length <= 1) {
      // Only top card or no cards, nothing to reshuffle
      return match;
    }

    // Keep top card, reshuffle the rest
    const topCard = match.discardPile.pop()!;
    const cardsToReshuffle = [...match.discardPile];
    match.drawDeck = this.shuffle(cardsToReshuffle);
    match.discardPile = [topCard];

    return match;
  }

  /**
   * Declare Niko Kadi (optional declaration when player has exactly 1 card).
   *
   * Requirements:
   * - Player must have exactly 1 card
   * - Player has not already declared Niko Kadi
   * - Player has sufficient wallet balance (≥ NIKO_KADI_PENALTY)
   * - x402 authorization successful (mocked for MVP)
   *
   * Effects:
   * - Deducts NIKO_KADI_PENALTY from player.walletBalance
   * - Adds NIKO_KADI_PENALTY to match.pool
   * - Sets player.nikoKadiDeclared = true
   * - Does NOT modify entry stake
   * - Platform sponsors gas (no gas charged to player)
   */
  declareNikoKadi(matchId: string, playerId: string): Match {
    const match = this.getMatch(matchId);

    if (!match.isActive) {
      throw new Error('Match is not active');
    }

    const player = match.players.find((p) => p.id === playerId);
    if (!player) {
      throw new Error(`Player ${playerId} not found in match`);
    }

    // Validation: Exactly 1 card required
    if (player.hand.length !== 1) {
      throw new Error(
        `Niko Kadi requires exactly 1 card. Current hand: ${player.hand.length}`,
      );
    }

    // Validation: Cannot declare twice
    if (player.nikoKadiDeclared) {
      throw new Error('Niko Kadi already declared');
    }

    // Validation: Sufficient wallet balance
    if (player.walletBalance < NIKO_KADI_PENALTY) {
      throw new Error(
        `Insufficient wallet balance. Required: ${NIKO_KADI_PENALTY} KADI, Available: ${player.walletBalance} KADI`,
      );
    }

    // TODO: x402 authorization check (mocked as success for MVP)
    // const x402Authorized = await this.x402Service.authorize(playerId, 'NIKO_KADI');
    // if (!x402Authorized) {
    //   throw new Error('x402 authorization failed');
    // }
    const x402Authorized = true; // Mock: always authorized for MVP

    if (!x402Authorized) {
      throw new Error('Niko Kadi declaration not authorized');
    }

    // Execute: Deduct from wallet
    player.walletBalance -= NIKO_KADI_PENALTY;

    // Execute: Add to pool
    match.pool += NIKO_KADI_PENALTY;

    // Execute: Mark as declared
    player.nikoKadiDeclared = true;

    // Record on blockchain (platform sponsors gas)
    void this.blockchainService.recordNikoKadi(playerId, NIKO_KADI_PENALTY);

    // Record move in history
    this.recordMove(matchId, playerId, 'nikoKadi');

    return match;
  }

  /**
   * Get match by ID, throw if not found
   */
  private getMatch(matchId: string): Match {
    const match = this.matches.get(matchId);
    if (!match) {
      throw new Error(`Match ${matchId} not found`);
    }
    return match;
  }

  /**
   * Generate a standard 52-card deck and shuffle it
   */
  private generateDeck(): Card[] {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = [
      'A',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      'J',
      'Q',
      'K',
    ];
    const deck: Card[] = [];
    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({ suit, rank });
      }
    }
    return this.shuffle(deck);
  }

  /**
   * Fisher-Yates shuffle
   */
  private shuffle(cards: Card[]): Card[] {
    const deck = [...cards];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  /**
   * Record a move in the move history with hash generation.
   * Hash input: { matchId, moveIndex, playerId, action, cardPlayed? }
   * Timestamp is stored but NOT included in hash.
   */
  private recordMove(
    matchId: string,
    playerId: string,
    action: 'play' | 'draw' | 'nikoKadi',
    cardPlayed?: Card,
  ): void {
    const history = this.moveHistories.get(matchId) || [];
    const moveIndex = history.length;
    const timestamp = Date.now();

    // Generate hash (no timestamp in hash input)
    const hashInput = JSON.stringify({
      matchId,
      moveIndex,
      playerId,
      action,
      cardPlayed,
    });
    const hash = crypto.createHash('sha256').update(hashInput).digest('hex');

    const moveRecord: MoveHistory = {
      moveIndex,
      playerId,
      action,
      cardPlayed,
      timestamp,
      hash,
    };

    history.push(moveRecord);
    this.moveHistories.set(matchId, history);
  }

  /**
   * Get move history for a match (for debugging/auditing)
   */
  getMoveHistory(matchId: string): MoveHistory[] {
    return this.moveHistories.get(matchId) || [];
  }

  /**
   * Get a match by ID (for external access)
   */
  getMatchById(matchId: string): Match | undefined {
    return this.matches.get(matchId);
  }
}
