import { Level, LoggerInterface } from '@apimatic/core-interfaces';

export interface LoggingOptions {
  logger?: LoggerInterface;
  logLevel?: Level;
  logRequest?: LogRequestOptions;
  logResponse?: LogBaseOptions;
}

export interface LogBaseOptions {
  logBody?: boolean;
  logHeaders?: boolean;
  headerToExclude?: string[];
  headerToInclude?: string[];
}

export interface LogRequestOptions extends LogBaseOptions {
  includeQueryInPath?: boolean;
}
