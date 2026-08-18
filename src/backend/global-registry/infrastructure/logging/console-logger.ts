import type { LoggerPort } from './logger-port';

export class ConsoleLogger implements LoggerPort {
  info(message: string, context?: Record<string, unknown>): void {
    console.info(`[global-registry] ${message}`, context ?? {});
  }

  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(`[global-registry] ${message}`, context ?? {});
  }

  error(message: string, context?: Record<string, unknown>): void {
    console.error(`[global-registry] ${message}`, context ?? {});
  }
}
