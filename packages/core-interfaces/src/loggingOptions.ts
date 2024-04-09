import { HttpRequest } from './httpRequest';
import { HttpResponse } from './httpResponse';

export interface ApiLoggerInterface {
  logRequest(coreRequest: HttpRequest): void;
  logResponse(coreResponse: HttpResponse): void;
}

export interface LoggerInterface {
  log(level: Level, message: string, ...params: any[]): void;
}

export enum Level {
  Error = 'error',
  Warn = 'warn',
  Info = 'info',
  Debug = 'debug',
  Trace = 'trace',
}
