import { Injectable } from '@nestjs/common';
import { Player, Match, Card } from './game.interfaces';
import * as crypto from 'crypto';

@Injectable()
export class GameEngineService {
  private matches: Map<string, Match> = new Map();

  createMatch(players: Player[], stakes: number): Match {
    const id = crypto.randomUUID();
    const deck = this.createShuffledDeck();
    const match: Match = {
      id,
      players,
      deck: { cards: deck },
      discardPile: [],
      currentPlayerIndex: 0,
      moveHistory: [],
      stakes,
      isActive: true,
    };
    this.matches.set(id, match);
    return match;
  }

  createShuffledDeck(): Card[] {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = [
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
      for (const value of values) {
        deck.push({ suit, value });
      }
    }
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  drawCard(matchId: string): Card | null {
    const match = this.matches.get(matchId);
    if (!match || !match.isActive) return null;
    if (match.deck.cards.length === 0) {
      this.reshuffleDiscardIntoDeck(match);
    }
    return match.deck.cards.pop() || null;
  }

  reshuffleDiscardIntoDeck(match: Match) {
    if (match.discardPile.length > 1) {
      const topCard = match.discardPile.pop();
      match.deck.cards = this.shuffle([...match.discardPile]);
      match.discardPile = [topCard!];
    }
  }

  shuffle(cards: Card[]): Card[] {
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards;
  }

  nextTurn(matchId: string) {
    const match = this.matches.get(matchId);
    if (!match || !match.isActive) return;
    match.currentPlayerIndex =
      (match.currentPlayerIndex + 1) % match.players.length;
  }

  verifyMoveHash(move: string, hash: string): boolean {
    const calculated = crypto.createHash('sha256').update(move).digest('hex');
    return calculated === hash;
  }

  // Add more game logic as needed (Niko Kadi micro-stakes, etc.)
}
