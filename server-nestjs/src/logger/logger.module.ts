import { Module } from '@nestjs/common';
import { ConsoleLoggerService } from './console-logger.service';
import { Logger } from './logger.interface';

@Module({
  providers: [
    {
      provide: Logger,
      useClass: ConsoleLoggerService,
    },
  ],
  exports: [Logger],
})
export class LoggerModule {}
