import { Logger } from "./Logger";

export class ConsoleLogger implements Logger {
  public debug(...args: any[]) {
    console.debug(...args);
  }

  public info(...args: any[]) {
    console.info(...args);
  }

  public error(...args: any[]) {
    console.error(...args);
  }
}
