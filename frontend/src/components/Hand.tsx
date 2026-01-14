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
    <div className="w-full px-4 mt-4">
      {/* Wallet Balance */}
      <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg mb-3 flex justify-between items-center max-w-2xl mx-auto">
        <span className="font-semibold text-sm">Your Wallet</span>
        <span className="text-xl font-bold">{walletBalance} KADI</span>
      </div>

      {/* Hand Cards */}
      <div className="bg-green-900/20 backdrop-blur p-4 rounded-xl shadow-xl border border-yellow-600/30 max-w-4xl mx-auto">
        <h2 className="text-lg font-bold mb-3 text-center">Your Hand ({cards.length} cards)</h2>
        
        <div className="flex flex-wrap gap-2 justify-center mb-4 min-h-[140px]">
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
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleDrawCard}
            disabled={!isMyTurn}
            className={`
              px-5 py-2 rounded-lg font-bold transition-all transform text-sm
              ${isMyTurn 
                ? 'bg-yellow-600 hover:bg-yellow-700 hover:scale-105 text-white shadow-lg' 
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
              px-5 py-2 rounded-lg font-bold transition-all transform text-sm
              ${cards.length === 1 && walletBalance >= 10
                ? 'bg-orange-600 hover:bg-orange-700 hover:scale-105 text-white shadow-lg' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }
            `}
            title={
              cards.length !== 1 
                ? `Need exactly 1 card (you have ${cards.length})` 
                : walletBalance < 10 
                ? 'Insufficient wallet balance (need 10 KADI)' 
                : 'Required before winning! Costs 10 KADI from wallet'
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
              ✓ Ready to declare Niko Kadi • Required before playing your last card!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hand;
