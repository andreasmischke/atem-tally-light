import { Module } from '@nestjs/common';
import { AtemModule } from 'src/atem';
import { LoggerModule } from 'src/logger';
import { AtemTallyGateway } from './atem-tally.gateway';
import { AtemTallyService } from './atem-tally.service';

@Module({
  imports: [AtemModule, LoggerModule],
  providers: [AtemTallyService, AtemTallyGateway],
})
export class AtemTallyModule {}
