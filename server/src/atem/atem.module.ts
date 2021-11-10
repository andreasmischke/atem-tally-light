import { Module } from '@nestjs/common';
import { LoggerModule } from 'src/logger';
import { AtemGateway } from './atem.gateway';
import { AtemService } from './atem.service';

@Module({
  imports: [LoggerModule],
  providers: [AtemService, AtemGateway],
  exports: [AtemService],
})
export class AtemModule {
  constructor(private atemService: AtemService) {
    const { ATEM_SWITCHER_IP } = process.env; // this.config.get<string>('ATEM_SWITCHER_IP');

    if (ATEM_SWITCHER_IP === undefined) {
      throw new Error('ATEM_SWITCHER_IP missing in environment variables');
    }

    this.atemService.connect({ ip: ATEM_SWITCHER_IP });
  }
}
