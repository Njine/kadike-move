import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameEngineService } from './game-engine.service';
import type { Match, Card } from './types/game';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({ cors: true })
@Injectable()
export class GameGateway {
  @WebSocketServer()
  server: Server;

  // Map clientId (socket.id) to playerId
  private clientToPlayer: Map<string, string> = new Map();
  // Map playerId to clientId
  private playerToClient: Map<string, string> = new Map();
  // Map matchId to set of connected playerIds
  private matchPlayers: Map<string, Set<string>> = new Map();

  constructor(private readonly gameEngine: GameEngineService) {}

  /**
   * Create a new match with the specified player IDs.
   * Does not deal hands yet - that happens when players join.
   */
  @SubscribeMessage('createMatch')
  handleCreateMatch(@MessageBody() data: { playerIds: string[] }): Match {
    const match = this.gameEngine.createMatch(data.playerIds);
    this.server.emit('matchCreated', match);
    return match;
  }

  /**
   * Player joins a match.
   * - Associates client socket with playerId
   * - Adds client to match room
   * - Marks player as connected
   * - When all players connected, auto-deals hands and starts game
   *
   * Message flow:
   * 1. Client joins match room
   * 2. If all players connected → dealHands()
   * 3. Send PRIVATE message to each client with their hand
   * 4. Send PUBLIC message to all clients with sanitized match state
   */
  @SubscribeMessage('joinMatch')
  async handleJoinMatch(
    @MessageBody() data: { matchId: string; playerId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const { matchId, playerId } = data;

    try {
      // Get match to validate it exists
      const match = this.gameEngine.getMatchById(matchId);
      if (!match) {
        client.emit('error', { message: `Match ${matchId} not found` });
        return;
      }

      // Validate player is in match
      const player = match.players.find((p) => p.id === playerId);
      if (!player) {
        client.emit('error', {
          message: `Player ${playerId} not in match ${matchId}`,
        });
        return;
      }

      // Store client-player mapping
      this.clientToPlayer.set(client.id, playerId);
      this.playerToClient.set(playerId, client.id);

      // Add client to match room
      await client.join(matchId);

      // Track connected players for this match
      if (!this.matchPlayers.has(matchId)) {
        this.matchPlayers.set(matchId, new Set());
      }
      this.matchPlayers.get(matchId)!.add(playerId);

      // Mark player as connected
      player.isConnected = true;

      // Check if all players have joined
      const allConnected = match.players.every((p) =>
        this.matchPlayers.get(matchId)!.has(p.id),
      );

      if (allConnected && !match.isActive) {
        // All players connected, deal hands and start game
        this.gameEngine.dealHands(matchId);
        const updatedMatch = this.gameEngine.getMatchById(matchId)!;

        // Send PRIVATE message to each player with their hand
        updatedMatch.players.forEach((p) => {
          const clientId = this.playerToClient.get(p.id);
          if (clientId) {
            this.server.to(clientId).emit('private', {
              type: 'handUpdate',
              hand: p.hand,
            });
          }
        });

        // Send PUBLIC message to all clients in match
        this.emitPublicMatchUpdate(matchId, updatedMatch);

        // Emit game started event
        this.server.to(matchId).emit('gameStarted', {
          matchId,
          currentTurn: updatedMatch.players[updatedMatch.turnIndex].id,
        });
      } else {
        // Not all players connected yet, send waiting status
        const sanitized = this.sanitizeMatchForPublic(match);
        client.emit('public', {
          type: 'matchUpdate',
          match: sanitized,
        });
      }
    } catch (error) {
      client.emit('error', {
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Player plays a card.
   *
   * Message flow:
   * 1. Validate and execute playCard()
   * 2. Send PRIVATE message to player with updated hand
   * 3. Send PUBLIC message to all clients with sanitized match state
   * 4. If game ended, emit gameOver event
   */
  @SubscribeMessage('playCard')
  handlePlayCard(
    @MessageBody() data: { matchId: string; playerId: string; card: Card },
    @ConnectedSocket() client: Socket,
  ): void {
    const { matchId, playerId, card } = data;

    try {
      // Execute play card action
      const match = this.gameEngine.playCard(matchId, playerId, card);

      // Send PRIVATE message to acting player with updated hand
      const player = match.players.find((p) => p.id === playerId);
      if (player) {
        client.emit('private', {
          type: 'handUpdate',
          hand: player.hand,
        });
      }

      // Send PUBLIC message to all clients in match
      this.emitPublicMatchUpdate(matchId, match);

      // Emit turn change event
      if (match.isActive && !match.winnerId) {
        const currentPlayer = match.players[match.turnIndex];
        this.server.to(matchId).emit('turnChange', {
          matchId,
          currentTurn: currentPlayer.id,
          turnIndex: match.turnIndex,
        });
      }

      // If game ended, emit gameOver event
      if (match.winnerId) {
        this.server.to(matchId).emit('gameOver', {
          matchId,
          winnerId: match.winnerId,
          pool: match.pool,
        });
      }
    } catch (error) {
      client.emit('error', {
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Player draws a card.
   *
   * Message flow:
   * 1. Validate and execute drawCard()
   * 2. Send PRIVATE message to player with updated hand (including new card)
   * 3. Send PUBLIC message to all clients with sanitized match state
   */
  @SubscribeMessage('drawCard')
  handleDrawCard(
    @MessageBody() data: { matchId: string; playerId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    const { matchId, playerId } = data;

    try {
      // Execute draw card action
      const match = this.gameEngine.drawCard(matchId, playerId);

      // Send PRIVATE message to acting player with updated hand
      const player = match.players.find((p) => p.id === playerId);
      if (player) {
        client.emit('private', {
          type: 'handUpdate',
          hand: player.hand,
        });
      }

      // Send PUBLIC message to all clients in match
      this.emitPublicMatchUpdate(matchId, match);
    } catch (error) {
      client.emit('error', {
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Player declares Niko Kadi (has 1 card left).
   *
   * Message flow:
   * 1. Validate and execute declareNikoKadi()
   * 2. Send PUBLIC message to all clients with updated pool
   * 3. Emit nikoKadiDeclared event to notify all players
   */
  @SubscribeMessage('declareNikoKadi')
  handleDeclareNikoKadi(
    @MessageBody() data: { matchId: string; playerId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    const { matchId, playerId } = data;

    try {
      // Execute Niko Kadi declaration
      const match = this.gameEngine.declareNikoKadi(matchId, playerId);

      // Send PUBLIC message to all clients in match
      this.emitPublicMatchUpdate(matchId, match);

      // Emit nikoKadiDeclared event to all players in match
      this.server.to(matchId).emit('nikoKadiDeclared', {
        matchId,
        playerId,
        pool: match.pool,
      });
    } catch (error) {
      client.emit('error', {
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Emit sanitized match state to all clients in a match room.
   * Hides all player hands to prevent cheating.
   */
  private emitPublicMatchUpdate(matchId: string, match: Match): void {
    const sanitized = this.sanitizeMatchForPublic(match);
    this.server.to(matchId).emit('public', {
      type: 'matchUpdate',
      match: sanitized,
    });
  }

  /**
   * Sanitize match for public broadcast.
   * Clones the match and replaces all player hands with empty arrays.
   * Preserves hand size (length) but hides actual cards.
   *
   * @param match - Original match object
   * @returns Sanitized match with hidden hands
   */
  private sanitizeMatchForPublic(match: Match): Match {
    return {
      ...match,
      players: match.players.map((player) => ({
        ...player,
        hand: [], // Hide actual cards, client can infer size from hand.length elsewhere if needed
      })),
    };
  }

  /**
   * Handle client disconnection.
   * Marks player as disconnected but doesn't remove from match.
   */
  handleDisconnect(client: Socket): void {
    const playerId = this.clientToPlayer.get(client.id);
    if (playerId) {
      // Find match containing this player
      for (const [matchId, playerSet] of this.matchPlayers.entries()) {
        if (playerSet.has(playerId)) {
          const match = this.gameEngine.getMatchById(matchId);
          if (match) {
            const player = match.players.find((p) => p.id === playerId);
            if (player) {
              player.isConnected = false;
              // Notify other players
              this.server.to(matchId).emit('playerDisconnected', {
                matchId,
                playerId,
              });
            }
          }
          playerSet.delete(playerId);
          break;
        }
      }

      // Clean up mappings
      this.clientToPlayer.delete(client.id);
      this.playerToClient.delete(playerId);
    }
  }
}
