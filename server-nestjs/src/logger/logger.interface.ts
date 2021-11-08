export abstract class Logger {
  abstract debug(...args: any[]): void;
  abstract info(...args: any[]): void;
  abstract error(...args: any[]): void;
}
