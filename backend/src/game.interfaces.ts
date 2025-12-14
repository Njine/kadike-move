export interface Player {
  id: string;
  name: string;
  tokens: number;
  isConnected: boolean;
}

export interface Card {
  suit: string; // e.g. 'hearts', 'spades', etc.
  value: string; // e.g. 'A', '2', ... 'K'
}

export interface Deck {
  cards: Card[];
}

export interface MoveHistory {
  playerId: string;
  move: string;
  timestamp: number;
  moveHash: string;
}

export interface Match {
  id: string;
  players: Player[];
  deck: Deck;
  discardPile: Card[];
  currentPlayerIndex: number;
  moveHistory: MoveHistory[];
  stakes: number;
  isActive: boolean;
  winnerId?: string;
}
