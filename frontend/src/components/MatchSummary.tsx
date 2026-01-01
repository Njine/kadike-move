import React from 'react';

interface MatchSummaryProps {
  winnerId: string;
  winnerName?: string;
  pool: number;
  myPlayerId: string;
}

const MatchSummary: React.FC<MatchSummaryProps> = ({ winnerId, winnerName, pool, myPlayerId }) => {
  const isWinner = winnerId === myPlayerId;
  
  return (
    <div style={{ 
      padding: '24px', 
      background: isWinner ? '#065f46' : '#1f2937', 
      borderRadius: '8px', 
      marginTop: '20px',
      textAlign: 'center'
    }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
        {isWinner ? '🎉 You Win! 🎉' : 'Game Over'}
      </h2>
      
      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '18px', marginBottom: '8px' }}>
          Winner: <span style={{ fontWeight: 'bold', color: '#fbbf24' }}>
            {isWinner ? 'You' : (winnerName || winnerId)}
          </span>
        </p>
        
        <p style={{ fontSize: '20px', fontWeight: 'bold' }}>
          Prize Pool: <span style={{ color: '#fbbf24' }}>{pool} tokens</span>
        </p>
      </div>

      <button
        onClick={() => window.location.reload()}
        style={{
          padding: '12px 24px',
          background: '#3b82f6',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
        }}
      >
        Play Again
      </button>
    </div>
  );
};

export default MatchSummary;
