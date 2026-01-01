import { Module } from '@nestjs/common';
import { GameEngineService } from './game-engine.service';
import { GameGateway } from './game.gateway';
import { BlockchainService } from './blockchain/blockchain.service';

@Module({
  providers: [GameEngineService, GameGateway, BlockchainService],
  exports: [GameEngineService],
})
export class GameModule {}
