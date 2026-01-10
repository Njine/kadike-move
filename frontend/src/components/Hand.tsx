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
    <div className="w-full px-4 mt-8">
      {/* Wallet Balance */}
      <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg mb-4 flex justify-between items-center max-w-6xl mx-auto">
        <span className="font-semibold text-lg">Your Wallet</span>
        <span className="text-2xl font-bold">{walletBalance} KADI</span>
      </div>

      {/* Hand Cards */}
      <div className="bg-gray-800/50 backdrop-blur p-8 rounded-xl shadow-xl border border-gray-700 max-w-6xl mx-auto">
        <h2 className="text-xl font-bold mb-4 text-center">Your Hand ({cards.length} cards)</h2>
        
        <div className="flex flex-wrap gap-3 justify-center mb-6 min-h-[180px]">
          {cards.length === 0 ? (
            <p className="text-gray-400 self-center">No cards in hand</p>
          ) : (
            cards.map((card, index) => (
              <div
                key={`${card.suit}-${card.rank}-${index}`}
                className="transform hover:scale-110 hover:-translate-y-2 transition-all cursor-pointer"
              >
                <Card
                  card={card}
                  onClick={() => handleCardClick(card)}
                  disabled={!isMyTurn}
                />
              </div>
            ))
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleDrawCard}
            disabled={!isMyTurn}
            className={`
              px-6 py-3 rounded-lg font-bold transition-all transform
              ${isMyTurn 
                ? 'bg-blue-600 hover:bg-blue-700 hover:scale-105 text-white shadow-lg' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            🎴 Draw Card
          </button>

          <button
            onClick={handleDeclareNikoKadi}
            disabled={cards.length !== 1 || walletBalance < 10}
            className={`
              px-6 py-3 rounded-lg font-bold transition-all transform
              ${cards.length === 1 && walletBalance >= 10
                ? 'bg-amber-600 hover:bg-amber-700 hover:scale-105 text-white shadow-lg' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }
            `}
            title={
              cards.length !== 1 
                ? `Need exactly 1 card (you have ${cards.length})` 
                : walletBalance < 10 
                ? 'Insufficient wallet balance (need 10 KADI)' 
                : 'Optional: Costs 10 KADI from wallet'
            }
          >
            ⚡ Niko Kadi (10 KADI)
          </button>
        </div>

        {/* Helper Messages */}
        <div className="mt-4 text-center text-sm">
          {cards.length !== 1 && cards.length > 0 && (
            <p className="text-red-400">
              Niko Kadi requires exactly 1 card (you have {cards.length})
            </p>
          )}
          {cards.length === 1 && walletBalance < 10 && (
            <p className="text-red-400">
              Insufficient balance (need 10 KADI, have {walletBalance} KADI)
            </p>
          )}
          {cards.length === 1 && walletBalance >= 10 && (
            <p className="text-green-400">
              ✓ Ready to declare Niko Kadi • Optional confidence move
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hand;
