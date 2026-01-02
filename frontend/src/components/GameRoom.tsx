import React, { useEffect, useState, useMemo } from 'react';
import {
  connectSocket,
  getSocket,
  joinMatch as emitJoinMatch,
  disconnectSocket,
} from '../utils/websocket';
import type { Match, Card } from '../types/game';
import Lobby from './Lobby';
import MatchBoard from './MatchBoard';
import Hand from './Hand';
import MatchSummary from './MatchSummary';

interface GameRoomProps {
  serverUrl?: string;
}

const GameRoom: React.FC<GameRoomProps> = ({
  serverUrl = 'http://localhost:3001',
}) => {
  // Player identity
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);

  // Lobby state
  const [isWaiting, setIsWaiting] = useState(false);

  // Game state (from Socket.IO events)
  const [match, setMatch] = useState<Match | null>(null);
  const [hand, setHand] = useState<Card[]>([]);
  const [currentTurnPlayerId, setCurrentTurnPlayerId] = useState<string | null>(
    null,
  );

  // Game over state
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winnerId, setWinnerId] = useState<string | null>(null);

  // Computed: is it my turn?
  const isMyTurn = useMemo(() => {
    return playerId !== null && currentTurnPlayerId === playerId;
  }, [playerId, currentTurnPlayerId]);

  // Handler: Create match
  const handleCreateMatch = (playerIds: string[]) => {
    const socket = connectSocket(serverUrl);

    // Listen for matchCreated event (one-time)
    socket.once('matchCreated', (createdMatch: Match) => {
      setMatchId(createdMatch.id);
      setPlayerId(playerIds[0]); // First player is the creator
      setIsWaiting(true);
    });

    // Emit createMatch event
    socket.emit('createMatch', { playerIds });
  };

  // Handler: Join match
  const handleJoinMatch = (joinMatchId: string, joinPlayerId: string) => {
    setMatchId(joinMatchId);
    setPlayerId(joinPlayerId);
    setIsWaiting(true);
  };

  // Effect: Subscribe to Socket.IO events when player joins a match
  useEffect(() => {
    if (!matchId || !playerId) return;

    // Connect to Socket.IO server
    const socket = connectSocket(serverUrl);

    // Join the match
    emitJoinMatch(matchId, playerId);

    // Event: Public match state update
    socket.on('public', (data) => {
      if (data.type === 'matchUpdate') {
        setMatch(data.match);
        setIsWaiting(false); // Game has started

        // Update current turn from match state
        if (data.match.players && data.match.players.length > 0) {
          const currentPlayer = data.match.players[data.match.turnIndex];
          setCurrentTurnPlayerId(currentPlayer?.id || null);
        }
      }
    });

    // Event: Private hand update
    socket.on('private', (data) => {
      if (data.type === 'handUpdate') {
        setHand(data.hand);
      }
    });

    // Event: Game started
    socket.on('gameStarted', (data) => {
      console.log('[GameRoom] Game started:', data.matchId);
      setCurrentTurnPlayerId(data.currentTurn);
      setIsWaiting(false);
    });

    // Event: Turn change
    socket.on('turnChange', (data) => {
      console.log('[GameRoom] Turn changed to:', data.currentTurn);
      setCurrentTurnPlayerId(data.currentTurn);
    });

    // Event: Niko Kadi declared
    socket.on('nikoKadiDeclared', (data) => {
      console.log('[GameRoom] Niko Kadi declared by:', data.playerId);
      // Match state will be updated via 'public' event
    });

    // Event: Game over
    socket.on('gameOver', (data) => {
      console.log('[GameRoom] Game over! Winner:', data.winnerId);
      setGameOver(true);
      setWinnerId(data.winnerId);
    });

    // Event: Player disconnected
    socket.on('playerDisconnected', (data) => {
      console.warn('[GameRoom] Player disconnected:', data.playerId);
      // Match state will be updated via 'public' event
    });

    // Event: Error
    socket.on('error', (data) => {
      console.error('[GameRoom] Server error:', data.message);
      alert(`Server error: ${data.message}`);
    });

    // Cleanup: Remove all event listeners on unmount
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
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Kadike Move</h1>

        {/* Lobby: Before joining a match */}
        {!matchId && (
          <Lobby
            onCreateMatch={handleCreateMatch}
            onJoinMatch={handleJoinMatch}
            isWaiting={false}
          />
        )}

        {/* Lobby: Waiting for players */}
        {matchId && isWaiting && (
          <Lobby
            onCreateMatch={handleCreateMatch}
            onJoinMatch={handleJoinMatch}
            isWaiting={true}
            matchId={matchId}
          />
        )}

        {/* Game: Active match */}
        {match && match.isActive && !gameOver && playerId && (
          <>
            <MatchBoard
              match={match}
              currentPlayerId={currentTurnPlayerId}
              myPlayerId={playerId}
            />

            {hand.length > 0 && matchId && (
              <Hand
                cards={hand}
                matchId={matchId}
                playerId={playerId}
                isMyTurn={isMyTurn}
              />
            )}
          </>
        )}

        {/* Game Over: Show winner */}
        {gameOver && winnerId && match && playerId && (
          <MatchSummary
            winnerId={winnerId}
            winnerName={match.players.find((p) => p.id === winnerId)?.name}
            pool={match.pool}
            myPlayerId={playerId}
          />
        )}
      </div>
    </div>
  );
};

export default GameRoom;
