// Shared types with backend
export interface Card {
  suit: string;
  rank: string;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  stake: number;
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
  pool: number;
  isActive: boolean;
  winnerId?: string;
}
