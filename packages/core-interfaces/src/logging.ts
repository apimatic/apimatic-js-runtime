import { HttpRequest } from './httpRequest';
import { HttpResponse } from './httpResponse';

export interface ApiLoggerInterface {
  logRequest(request: HttpRequest): void;
  logResponse(response: HttpResponse): void;
}

export interface LoggerInterface {
  log(level: LogLevel, message: string, params: Record<string, any>): void;
}

export interface LoggingOptions {
  logger: LoggerInterface;
  logLevel: LogLevel;
  logRequest: HttpRequestLoggingOptions;
  logResponse: HttpMessageLoggingOptions;
  maskSensitiveHeaders: boolean;
}

export interface SdkLoggingOptions {
  logger: LoggerInterface;
  logLevel: LogLevel;
  logRequest: Partial<HttpRequestLoggingOptions>;
  logResponse: Partial<HttpMessageLoggingOptions>;
  maskSensitiveHeaders: boolean;
}

export interface HttpMessageLoggingOptions {
  logBody: boolean;
  logHeaders: boolean;
  headerToExclude: string[];
  headerToInclude: string[];
}

export interface HttpRequestLoggingOptions extends HttpMessageLoggingOptions {
  includeQueryInPath: boolean;
}

export enum LogLevel {
  Error = 'error',
  Warn = 'warn',
  Info = 'info',
  Debug = 'debug',
  Trace = 'trace',
}
