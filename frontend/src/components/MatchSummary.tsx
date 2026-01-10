import React from 'react';

interface MatchSummaryProps {
  winnerId: string;
  winnerName?: string;
  pool: number;
  myPlayerId: string;
}

const MatchSummary: React.FC<MatchSummaryProps> = ({ winnerId, winnerName, pool, myPlayerId }) => {
  const isWinner = winnerId === myPlayerId;
  
  // Calculate settlement breakdown (client-side for display)
  const PLATFORM_FEE_BPS = 350; // 3.5% in basis points
  const finalPool = pool;
  const platformFee = Math.floor((finalPool * PLATFORM_FEE_BPS) / 10_000);
  const winnerPayout = finalPool - platformFee;
  
  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div className={`
        p-8 rounded-2xl shadow-2xl text-center border-4
        ${isWinner 
          ? 'bg-gradient-to-br from-green-600 to-green-800 border-yellow-400' 
          : 'bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600'
        }
      `}>
        <h2 className="text-4xl font-bold mb-6 animate-bounce">
          {isWinner ? '🎉 Victory! 🎉' : '🎮 Game Over'}
        </h2>
        
        <div className="mb-8">
          <p className="text-xl mb-2">Winner</p>
          <p className="text-3xl font-bold text-yellow-400">
            {isWinner ? 'You!' : (winnerName || winnerId)}
          </p>
        </div>

        {/* Settlement Breakdown */}
        <div className="bg-gray-900/50 backdrop-blur p-6 rounded-xl mb-6 text-left border border-gray-600">
          <h3 className="text-lg font-bold mb-4 text-center text-gray-100">
            Settlement Breakdown
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center text-lg">
              <span className="text-gray-300">Final Pool:</span>
              <span className="font-bold text-yellow-400">{finalPool} KADI</span>
            </div>
            
            <div className="flex justify-between items-center text-lg">
              <span className="text-gray-300">Platform Fee (3.5%):</span>
              <span className="font-bold text-red-400">-{platformFee} KADI</span>
            </div>
            
            <div className="border-t border-gray-600 my-3"></div>
            
            <div className="flex justify-between items-center text-xl">
              <span className="font-bold text-gray-100">Winner Receives:</span>
              <span className="text-2xl font-bold text-green-400">{winnerPayout} KADI</span>
            </div>
          </div>
          
          <p className="text-xs text-gray-400 mt-4 italic text-center">
            Platform fee covers gas sponsorship and infrastructure
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="
            px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold 
            rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg
          "
        >
          🎴 Play Again
        </button>
      </div>
    </div>
  );
};

export default MatchSummary;
