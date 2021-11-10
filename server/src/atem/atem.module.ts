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
    this.atemService.connect({ ip: '192.168.2.104' });
  }
}
