import { LogLevel, LoggerInterface } from '@apimatic/core-interfaces';

// TODO: Add docblocks for all interfaces and properties.
export interface PartialLoggingOptions {
  logger?: LoggerInterface;
  logLevel?: LogLevel;
  logRequest?: PartialHttpRequestLoggingOptions;
  logResponse?: PartialHttpMessageLoggingOptions;
  maskSensitiveHeaders?: boolean;
}

export interface PartialHttpMessageLoggingOptions {
  logBody?: boolean;
  logHeaders?: boolean;
  headerToExclude?: string[];
  headerToInclude?: string[];
}

export interface PartialHttpRequestLoggingOptions
  extends PartialHttpMessageLoggingOptions {
  includeQueryInPath?: boolean;
}
