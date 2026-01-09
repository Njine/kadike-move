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
    <div style={{ padding: '16px', background: '#1f2937', borderRadius: '8px', marginTop: '20px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Match Board</h2>
      
      {/* Pool */}
      <div style={{ marginBottom: '16px', padding: '12px', background: '#374151', borderRadius: '4px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>Pool</h3>
        <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#fbbf24' }}>{match.pool} tokens</p>
      </div>

      {/* Top Discard Card */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Top Card</h3>
        {match.topDiscardCard ? (
          <Card card={match.topDiscardCard} disabled />
        ) : (
          <p style={{ color: '#9ca3af' }}>No cards played yet</p>
        )}
      </div>

      {/* Current Turn Indicator */}
      <div style={{ marginBottom: '16px', padding: '12px', background: '#065f46', borderRadius: '4px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>Current Turn</h3>
        <p style={{ fontSize: '18px' }}>
          {currentPlayerId === myPlayerId ? 'YOUR TURN' : currentPlayerId || 'Waiting...'}
        </p>
      </div>

      {/* Players List */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Players</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {match.players.map((player) => {
            const isCurrentTurn = player.id === currentPlayerId;
            const isMe = player.id === myPlayerId;
            
            return (
              <div
                key={player.id}
                style={{
                  padding: '12px',
                  background: isCurrentTurn ? '#1e40af' : '#374151',
                  borderRadius: '4px',
                  border: isMe ? '2px solid #fbbf24' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: '600' }}>
                      {player.name || player.id}
                      {isMe && ' (You)'}
                      {isCurrentTurn && ' ⭐'}
                    </span>
                    {!player.isConnected && (
                      <span style={{ marginLeft: '8px', color: '#ef4444' }}>(Disconnected)</span>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span>
                      {player.hand?.length || 0} card{player.hand?.length !== 1 ? 's' : ''}
                    </span>
                    
                    {isMe && (
                      <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>
                        💰 {player.walletBalance} KADI
                      </span>
                    )}
                    
                    {player.nikoKadiDeclared && (
                      <span
                        style={{
                          padding: '4px 8px',
                          background: '#f59e0b',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                        }}
                      >
                        NIKO KADI!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deck Info */}
      <div style={{ marginTop: '16px', padding: '12px', background: '#374151', borderRadius: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Draw Deck: {match.drawDeck.length} cards</span>
          <span>Discard Pile: {match.discardPile.length} cards</span>
        </div>
      </div>
    </div>
  );
};

export default MatchBoard;
