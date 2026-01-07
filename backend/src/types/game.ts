export interface Card {
  suit: string;
  rank: string;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  stake: number; // Entry stake (locked at match start, never modified)
  walletBalance: number; // KADI balance for optional actions (Niko Kadi penalties)
  nikoKadiDeclared: boolean;
  isConnected: boolean;
}

export interface Match {
  id: string;
  players: Player[];
  drawDeck: Card[];
  discardPile: Card[];
  topDiscardCard: Card | null;
  turnIndex: number;
  pool: number; // Entry stakes + Niko Kadi penalties (platform fee deducted at settlement only)
  isActive: boolean;
  winnerId?: string;
}

export interface MoveHistory {
  moveIndex: number;
  playerId: string;
  action: 'play' | 'draw' | 'nikoKadi';
  cardPlayed?: Card;
  timestamp: number;
  hash: string;
}
