import { Module } from '@nestjs/common';
import { LoggerModule } from 'src/logger';
import { assertEnv } from 'src/utils/assertEnv';
import { AtemGateway } from './atem.gateway';
import { AtemService } from './atem.service';

@Module({
  imports: [LoggerModule],
  providers: [AtemService, AtemGateway],
  exports: [AtemService],
})
export class AtemModule {
  constructor(private atemService: AtemService) {
    const ATEM_SWITCHER_IP = assertEnv('ATEM_SWITCHER_IP');

    this.atemService.connect({ ip: ATEM_SWITCHER_IP });
  }
}
