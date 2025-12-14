export interface Card {
  suit: string;
  rank: string;
}

export interface Player {
  id: string;
  hand: Card[];
  stake: number;
}

export interface Match {
  id: string;
  players: Player[];
  drawDeck: Card[];
  discardPile: Card[];
  turnIndex: number;
  pool: number;
}

export interface MoveHistory {
  playerId: string;
  cardPlayed?: Card;
  drawnCard?: Card;
  timestamp: number;
  hash: string;
}
