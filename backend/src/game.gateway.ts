import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { GameEngineService } from './game-engine.service';
import type { Match } from './types/game';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({ cors: true })
@Injectable()
export class GameGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly gameEngine: GameEngineService) {}

  @SubscribeMessage('createMatch')
  handleCreateMatch(@MessageBody() data: { playerIds: string[] }): Match {
    const match = this.gameEngine.createMatch(data.playerIds);
    this.server.emit('matchCreated', match);
    return match;
  }

  // Add more message handlers for moves, turns, etc.
}
