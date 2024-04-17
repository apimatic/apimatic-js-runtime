import { HttpRequest } from './httpRequest';
import { HttpResponse } from './httpResponse';

export interface ApiLoggerInterface {
  logRequest(request: HttpRequest): void;
  logResponse(response: HttpResponse): void;
}

export interface LoggerInterface {
  log(level: Level, message: string, params: Record<string, any>): void;
}

export interface LoggingOptions {
  logger?: LoggerInterface;
  logLevel?: Level;
  logRequest?: HttpRequestLoggingOptions;
  logResponse?: HttpMessageLoggingOptions;
}

export interface HttpMessageLoggingOptions {
  logBody?: boolean;
  logHeaders?: boolean;
  headerToExclude?: string[];
  headerToInclude?: string[];
}

export interface HttpRequestLoggingOptions extends HttpMessageLoggingOptions {
  includeQueryInPath?: boolean;
}
export enum Level {
  Error = 'error',
  Warn = 'warn',
  Info = 'info',
  Debug = 'debug',
  Trace = 'trace',
}
