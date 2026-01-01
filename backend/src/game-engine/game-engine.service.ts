import { Injectable } from '@nestjs/common';
import { Match, Player, Card, MoveHistory } from '../types/game';
import * as crypto from 'crypto';

@Injectable()
export class GameEngineService {
  private matches: Map<string, Match> = new Map();
  private moveHistories: Map<string, MoveHistory[]> = new Map();

  // Create a new match
  createMatch(players: Player[]): Match {
    const match: Match = {
      id: crypto.randomUUID(),
      players,
      drawDeck: this.generateDeck(),
      discardPile: [],
      topDiscardCard: null,
      turnIndex: 0,
      pool: players.reduce((sum, p) => sum + p.stake, 0),
      isActive: false,
      winnerId: undefined,
    };
    this.matches.set(match.id, match);
    this.moveHistories.set(match.id, []);
    return match;
  }

  // Generate a standard deck of cards
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

  // Shuffle utility
  private shuffle(deck: Card[]): Card[] {
    return deck.sort(() => Math.random() - 0.5);
  }

  // Additional methods to implement:
  // - playCard(playerId, matchId, card)
  // - drawCard(playerId, matchId)
  // - declareNikoKadi(playerId, matchId, stake)
  // - handleDrawDeckEmpty(matchId)
  // - computeMoveHash(matchId)
}
