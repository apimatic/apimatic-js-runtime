import { HttpRequest } from './httpRequest';
import { HttpResponse } from './httpResponse';

export interface ApiLoggerInterface {
  logRequest(request: HttpRequest): void;
  logResponse(response: HttpResponse): void;
}

export interface LoggerInterface {
  log(level: Level, message: string, params: Record<string, any>): void;
}

export enum Level {
  Error = 'error',
  Warn = 'warn',
  Info = 'info',
  Debug = 'debug',
  Trace = 'trace',
}
