import { Module } from '@nestjs/common';
import { GameEngineService } from './game-engine.service';
import { GameGateway } from './game.gateway';

@Module({
  providers: [GameEngineService, GameGateway],
  exports: [GameEngineService],
})
export class GameModule {}
