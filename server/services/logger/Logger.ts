export interface Logger {
  debug(...args: any[]): void;
  info(...args: any[]): void;
  error(...args: any[]): void;
}