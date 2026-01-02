import React from 'react';
import { playCard, drawCard, declareNikoKadi } from '../utils/websocket';
import type { Card as CardType } from '../types/game';
import Card from './Card';

interface HandProps {
  cards: CardType[];
  matchId: string;
  playerId: string;
  isMyTurn: boolean;
}

const Hand: React.FC<HandProps> = ({ cards, matchId, playerId, isMyTurn }) => {
  const handleCardClick = (card: CardType) => {
    if (!isMyTurn) {
      alert('Not your turn!');
      return;
    }
    playCard(matchId, playerId, card);
  };

  const handleDrawCard = () => {
    if (!isMyTurn) {
      alert('Not your turn!');
      return;
    }
    drawCard(matchId, playerId);
  };

  const handleDeclareNikoKadi = () => {
    declareNikoKadi(matchId, playerId);
  };

  return (
    <div style={{ padding: '16px', background: '#1e40af', borderRadius: '8px', marginTop: '20px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Your Hand</h2>
      
      <div style={{ marginBottom: '16px' }}>
        {cards.length === 0 ? (
          <p>No cards in hand</p>
        ) : (
          cards.map((card, index) => (
            <Card
              key={`${card.suit}-${card.rank}-${index}`}
              card={card}
              onClick={() => handleCardClick(card)}
              disabled={!isMyTurn}
            />
          ))
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleDrawCard}
          disabled={!isMyTurn}
          style={{
            padding: '8px 16px',
            background: isMyTurn ? '#10b981' : '#6b7280',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: isMyTurn ? 'pointer' : 'not-allowed',
          }}
        >
          Draw Card
        </button>

        <button
          onClick={handleDeclareNikoKadi}
          disabled={cards.length !== 1}
          style={{
            padding: '8px 16px',
            background: cards.length === 1 ? '#f59e0b' : '#6b7280',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: cards.length === 1 ? 'pointer' : 'not-allowed',
          }}
        >
          Declare Niko Kadi {cards.length === 1 ? '✓' : `(Need 1 card, have ${cards.length})`}
        </button>
      </div>
    </div>
  );
};

export default Hand;
