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
      </div>

      {/* Settlement Breakdown */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '16px', 
        background: '#374151', 
        borderRadius: '8px',
        textAlign: 'left'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', textAlign: 'center' }}>
          Settlement Breakdown
        </h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>Final Pool:</span>
          <span style={{ fontWeight: 'bold', color: '#fbbf24' }}>{finalPool} KADI</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>Platform Fee (3.5%, rounded down):</span>
          <span style={{ fontWeight: 'bold', color: '#ef4444' }}>-{platformFee} KADI</span>
        </div>
        
        <div style={{ 
          height: '1px', 
          background: '#6b7280', 
          margin: '12px 0' 
        }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontWeight: 'bold' }}>Winner Payout:</span>
          <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>{winnerPayout} KADI</span>
        </div>
        
        <p style={{ 
          fontSize: '11px', 
          color: '#9ca3af', 
          marginTop: '12px',
          fontStyle: 'italic' 
        }}>
          Platform fee covers gas sponsorship and infrastructure
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
