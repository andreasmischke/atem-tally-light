import { Injectable } from '@nestjs/common';
import { Logger } from './logger.interface';

@Injectable()
export class ConsoleLoggerService implements Logger {
  debug(...args: any[]) {
    console.debug(...args);
  }

  info(...args: any[]) {
    console.info(...args);
  }

  error(...args: any[]) {
    console.error(...args);
  }
}
