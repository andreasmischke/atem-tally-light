import { Logger } from "./Logger";

export class ConsoleLogger implements Logger {
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
