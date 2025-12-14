import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameEngineService } from './game-engine.service';
import { Player, Match } from './game.interfaces';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({ cors: true })
@Injectable()
export class GameGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly gameEngine: GameEngineService) {}

  @SubscribeMessage('createMatch')
  handleCreateMatch(
    @MessageBody() data: { players: Player[]; stakes: number },
    @ConnectedSocket() client: Socket,
  ): Match {
    const match = this.gameEngine.createMatch(data.players, data.stakes);
    this.server.emit('matchCreated', match);
    return match;
  }

  // Add more message handlers for moves, turns, etc.
}
