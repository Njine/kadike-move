import React from 'react';
import { playCard, drawCard, declareNikoKadi } from '../utils/websocket';
import type { Card as CardType } from '../types/game';
import Card from './Card';

interface HandProps {
  cards: CardType[];
  matchId: string;
  playerId: string;
  isMyTurn: boolean;
  walletBalance: number;
}

const Hand: React.FC<HandProps> = ({ cards, matchId, playerId, isMyTurn, walletBalance }) => {
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

      <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
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
            disabled={cards.length !== 1 || walletBalance < 10}
            style={{
              padding: '8px 16px',
              background: cards.length === 1 && walletBalance >= 10 ? '#f59e0b' : '#6b7280',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: cards.length === 1 && walletBalance >= 10 ? 'pointer' : 'not-allowed',
            }}
            title={cards.length !== 1 ? `Need exactly 1 card (you have ${cards.length})` : walletBalance < 10 ? 'Insufficient wallet balance (need 10 KADI)' : 'Optional: Costs 10 KADI from wallet'}
          >
            Declare Niko Kadi (Optional - 10 KADI)
          </button>
        </div>
        
        {/* Helper text for Niko Kadi button */}
        {cards.length !== 1 && (
          <p style={{ fontSize: '12px', color: '#fca5a5', margin: 0 }}>
            ⚠️ Niko Kadi requires exactly 1 card (you have {cards.length})
          </p>
        )}
        {cards.length === 1 && walletBalance < 10 && (
          <p style={{ fontSize: '12px', color: '#fca5a5', margin: 0 }}>
            ⚠️ Insufficient wallet balance (need 10 KADI, have {walletBalance} KADI)
          </p>
        )}
        {cards.length === 1 && walletBalance >= 10 && (
          <p style={{ fontSize: '12px', color: '#86efac', margin: 0 }}>
            ✓ Ready to declare • Optional confidence declaration • Costs 10 KADI
          </p>
        )}
      </div>
    </div>
  );
};

export default Hand;
