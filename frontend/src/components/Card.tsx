import React from 'react';
import type { Card as CardType } from '../types/game';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  disabled?: boolean;
}

const Card: React.FC<CardProps> = ({ card, onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-block',
        margin: '4px',
        padding: '8px 12px',
        border: '1px solid #333',
        borderRadius: '4px',
        background: disabled ? '#ccc' : '#fff',
        color: '#000',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <span style={{ fontWeight: 'bold' }}>{card.rank}</span>
      <span> {card.suit}</span>
    </button>
  );
};

export default Card;
