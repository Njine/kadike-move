import React from 'react';
import type { Match } from '../types/game';
import Card from './Card';

interface MatchBoardProps {
  match: Match;
  currentPlayerId: string | null;
  myPlayerId: string;
}

const MatchBoard: React.FC<MatchBoardProps> = ({ match, currentPlayerId, myPlayerId }) => {
  return (
    <div className="w-full px-4">
      {/* Pool Display */}
      <div className="bg-gradient-to-r from-amber-500 to-yellow-600 p-8 rounded-2xl shadow-2xl mb-8 text-center max-w-3xl mx-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Prize Pool</h3>
        <p className="text-6xl font-bold text-gray-900">{match.pool} KADI</p>
        <p className="text-xs text-gray-800 mt-2">
          Entry: 100 KADI per player • Platform fee: 3.5% at settlement
        </p>
      </div>

      {/* Playing Area */}
      <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-3xl p-12 shadow-2xl border-8 border-green-950 relative max-w-7xl mx-auto">
        {/* Center Card Display */}
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <h3 className="text-lg font-semibold mb-4 text-green-100">Current Card</h3>
          {match.topDiscardCard ? (
            <div className="transform hover:scale-105 transition-transform">
              <Card card={match.topDiscardCard} disabled />
            </div>
          ) : (
            <div className="w-32 h-48 bg-green-950/50 rounded-lg border-2 border-dashed border-green-600 flex items-center justify-center">
              <p className="text-green-400 text-sm">No cards played</p>
            </div>
          )}
          
          {/* Deck Info */}
          <div className="mt-6 flex gap-6 text-green-200 text-sm">
            <span>🎴 Draw: {match.drawDeck.length}</span>
            <span>🗂️ Discard: {match.discardPile.length}</span>
          </div>
        </div>

        {/* Players Around the Table */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          {match.players.map((player, index) => {
            const isCurrentTurn = player.id === currentPlayerId;
            const isMe = player.id === myPlayerId;
            
            return (
              <div
                key={player.id}
                className={`
                  px-4 py-2 rounded-lg shadow-lg transition-all
                  ${isCurrentTurn ? 'bg-blue-600 ring-4 ring-blue-400 ring-opacity-50 animate-pulse' : 'bg-gray-800/90'}
                  ${isMe ? 'border-2 border-yellow-400' : ''}
                `}
              >
                <div className="text-sm font-semibold">
                  {player.name || player.id}
                  {isMe && ' (You)'}
                </div>
                <div className="text-xs text-gray-300 mt-1">
                  {player.hand?.length || 0} card{player.hand?.length !== 1 ? 's' : ''}
                </div>
                {player.nikoKadiDeclared && (
                  <div className="text-xs bg-amber-500 text-gray-900 px-2 py-1 rounded mt-1 font-bold">
                    NIKO KADI!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Turn Indicator */}
      <div className="mt-6 text-center">
        <div className={`inline-block px-6 py-3 rounded-full font-bold text-lg ${
          currentPlayerId === myPlayerId 
            ? 'bg-green-600 text-white animate-pulse' 
            : 'bg-gray-700 text-gray-300'
        }`}>
          {currentPlayerId === myPlayerId ? '🎯 YOUR TURN' : `⏳ ${currentPlayerId || 'Waiting...'}'s turn`}
        </div>
      </div>
    </div>
  );
};

export default MatchBoard;
