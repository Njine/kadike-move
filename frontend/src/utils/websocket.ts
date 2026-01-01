import { io, Socket } from 'socket.io-client';
import type { Card, Match } from '../types/game';

// Event types for type safety
export interface ServerToClientEvents {
  matchCreated: (match: Match) => void;
  gameStarted: (data: { matchId: string; currentTurn: string }) => void;
  turnChange: (data: { matchId: string; currentTurn: string; turnIndex: number }) => void;
  nikoKadiDeclared: (data: { matchId: string; playerId: string; pool: number }) => void;
  gameOver: (data: { matchId: string; winnerId: string; pool: number }) => void;
  playerDisconnected: (data: { matchId: string; playerId: string }) => void;
  private: (data: { type: 'handUpdate'; hand: Card[] }) => void;
  public: (data: { type: 'matchUpdate'; match: Match }) => void;
  error: (data: { message: string }) => void;
}

export interface ClientToServerEvents {
  createMatch: (data: { playerIds: string[] }) => void;
  joinMatch: (data: { matchId: string; playerId: string }) => void;
  playCard: (data: { matchId: string; playerId: string; card: Card }) => void;
  drawCard: (data: { matchId: string; playerId: string }) => void;
  declareNikoKadi: (data: { matchId: string; playerId: string }) => void;
}

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: TypedSocket | null = null;

/**
 * Connect to Socket.IO server
 * @param url - Server URL (e.g., 'http://localhost:3000')
 */
export function connectSocket(url: string): TypedSocket {
  if (socket?.connected) {
    return socket;
  }

  socket = io(url, {
    transports: ['websocket'],
    autoConnect: true,
  });

  socket.on('connect', () => {
    console.log('Socket.IO connected:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket.IO disconnected');
  });

  socket.on('error', (data) => {
    console.error('Socket error:', data.message);
  });

  return socket;
}

/**
 * Get current socket instance
 */
export function getSocket(): TypedSocket | null {
  return socket;
}

/**
 * Disconnect from server
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Emit joinMatch event
 */
export function joinMatch(matchId: string, playerId: string): void {
  socket?.emit('joinMatch', { matchId, playerId });
}

/**
 * Emit playCard event
 */
export function playCard(matchId: string, playerId: string, card: Card): void {
  socket?.emit('playCard', { matchId, playerId, card });
}

/**
 * Emit drawCard event
 */
export function drawCard(matchId: string, playerId: string): void {
  socket?.emit('drawCard', { matchId, playerId });
}

/**
 * Emit declareNikoKadi event
 */
export function declareNikoKadi(matchId: string, playerId: string): void {
  socket?.emit('declareNikoKadi', { matchId, playerId });
}
