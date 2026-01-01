import React, { useEffect, useState } from 'react';
import { connectSocket, getSocket, joinMatch as emitJoinMatch, disconnectSocket } from '../utils/websocket';
import type { Match, Card } from '../types/game';
import Lobby from './Lobby';
import MatchBoard from './MatchBoard';
import Hand from './Hand';
import MatchSummary from './MatchSummary';

interface GameRoomProps {
  serverUrl?: string;
}

const GameRoom: React.FC<GameRoomProps> = ({ 
  serverUrl = 'http://localhost:3000' 
}) => {
  // Lobby state
  const [matchId, setMatchId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isWaiting, setIsWaiting] = useState(false);
  
  // Public match state (sanitized - no hands visible)
  const [match, setMatch] = useState<Match | null>(null);
  
  // Private player hand
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  
  // Current turn player ID
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  
  // Game over state
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winnerId, setWinnerId] = useState<string | null>(null);

  const handleCreateMatch = (playerIds: string[]) => {
    const socket = connectSocket(serverUrl);
    
    // Listen for matchCreated event
    socket.once('matchCreated', (createdMatch: Match) => {
      setMatchId(createdMatch.id);
      setPlayerId(playerIds[0]); // First player is the creator
      setIsWaiting(true);
    });
    
    // Emit createMatch event
    socket.emit('createMatch', { playerIds });
  };

  const handleJoinMatch = (joinMatchId: string, joinPlayerId: string) => {
    setMatchId(joinMatchId);
    setPlayerId(joinPlayerId);
    setIsWaiting(true);
  };

  useEffect(() => {
    if (!matchId || !playerId) return;

    // Connect to Socket.IO server
    const socket = connectSocket(serverUrl);

    // Join the match
    emitJoinMatch(matchId, playerId);

    // Listen to server events
    socket.on('public', (data) => {
      if (data.type === 'matchUpdate') {
        setMatch(data.match);
        setIsWaiting(false); // Game has started
        // Update current turn from match state
        if (data.match.players && data.match.players.length > 0) {
          const currentPlayer = data.match.players[data.match.turnIndex];
          setCurrentPlayerId(currentPlayer?.id || null);
        }
      }
    });

    socket.on('private', (data) => {
      if (data.type === 'handUpdate') {
        setPlayerHand(data.hand);
      }
    });

    socket.on('gameStarted', (data) => {
      console.log('Game started!', data);
      setCurrentPlayerId(data.currentTurn);
      setIsWaiting(false);
    });

    socket.on('turnChange', (data) => {
      console.log('Turn changed to:', data.currentTurn);
      setCurrentPlayerId(data.currentTurn);
    });

    socket.on('nikoKadiDeclared', (data) => {
      console.log('Niko Kadi declared by:', data.playerId);
      // Match state will be updated via 'public' event
    });

    socket.on('gameOver', (data) => {
      console.log('Game over! Winner:', data.winnerId);
      setGameOver(true);
      setWinnerId(data.winnerId);
    });

    socket.on('playerDisconnected', (data) => {
      console.log('Player disconnected:', data.playerId);
    });

    socket.on('error', (data) => {
      console.error('Server error:', data.message);
    });

    // Cleanup on unmount
    return () => {
      const currentSocket = getSocket();
      if (currentSocket) {
        currentSocket.off('public');
        currentSocket.off('private');
        currentSocket.off('gameStarted');
        currentSocket.off('turnChange');
        currentSocket.off('nikoKadiDeclared');
        currentSocket.off('gameOver');
        currentSocket.off('playerDisconnected');
        currentSocket.off('error');
      }
      disconnectSocket();
    };
  }, [matchId, playerId, serverUrl]);

  return (
    <div className="game-room">
      <h1>Kadike Move</h1>
      
      {!matchId && (
        <Lobby 
          onCreateMatch={handleCreateMatch}
          onJoinMatch={handleJoinMatch}
          isWaiting={false}
        />
      )}
      
      {matchId && isWaiting && (
        <Lobby 
          onCreateMatch={handleCreateMatch}
          onJoinMatch={handleJoinMatch}
          isWaiting={true}
          matchId={matchId}
        />
      )}
      
      {match && match.isActive && (
        <>
          {matchId && playerId && (
            <MatchBoard 
              match={match}
              currentPlayerId={currentPlayerId}
              myPlayerId={playerId}
            />
          )}
          
          {playerHand.length > 0 && matchId && playerId && (
            <Hand 
              cards={playerHand}
              matchId={matchId}
              playerId={playerId}
              isMyTurn={currentPlayerId === playerId}
            />
          )}
        </>
      )}
      
      {gameOver && winnerId && match && playerId && (
        <MatchSummary 
          winnerId={winnerId}
          winnerName={match.players.find(p => p.id === winnerId)?.name}
          pool={match.pool}
          myPlayerId={playerId}
        />
      )}
      
      {matchId && playerId && (
        <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0' }}>
          <h3>Debug Info</h3>
          <p>Player ID: {playerId}</p>
          <p>Match ID: {matchId}</p>
          <p>Current Turn: {currentPlayerId || 'Waiting...'}</p>
          <p>Hand Size: {playerHand.length}</p>
          <p>Game Active: {match?.isActive ? 'Yes' : 'No'}</p>
          <p>Game Over: {gameOver ? 'Yes' : 'No'}</p>
        </div>
      )}
    </div>
  );
};

export default GameRoom;
