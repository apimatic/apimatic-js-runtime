import winston, { LoggerOptions } from 'winston';

export enum Level {
  Error = 'error',
  Warn = 'warn',
  Info = 'info',
  Debug = 'debug',
  Trace = 'trace',
}

export enum HeaderLoggingPolicy {
  Include = 'include',
  Exculde = 'exclude',
}

export enum Format {
  Simple,
  Json,
}

export enum Sink {
  Console,
}

export interface LoggerBuilder {
  create(): void;
  setLevel(level: Level): void;
  setFormat(format: Format): void;
  setSink(sink: Sink): void;
  trace(message: string, ...optionalParams: any[]): void;
  debug(message: string, ...optionalParams: any[]): void;
  info(message: string, ...optionalParams: any[]): void;
  warn(message: string, ...optionalParams: any[]): void;
  error(message: string, ...optionalParams: any[]): void;
}

export interface LoggingConfiguration {
  isLoggingRequestInfo: boolean;
  isLoggingRequestHeaders: boolean;
  isLoggingRequestBody: boolean;
  isLoggingResponseInfo: boolean;
  isLoggingResponseHeaders: boolean;
  isLoggingResponseBody: boolean;
  headerFilters: string[];
  headerLoggingPolicy: HeaderLoggingPolicy;
  level: Level;
  sink: Sink;
  format: Format;
}

export class DefaultLoggerBuilder implements LoggerBuilder {
  private _loggerOptions: LoggerOptions;
  private _logger: winston.Logger;

  constructor() {
    // Initialize logger options with default values
    this._loggerOptions = {
      level: 'info', // Default log level
      format: winston.format.simple(), // Default format
      transports: [new winston.transports.Console()], // Default transport
    };
    // Create the logger instance
    this._logger = winston.createLogger(this._loggerOptions);
  }

  public create(): void {
    this._logger = winston.createLogger(this._loggerOptions);
  }
  public trace(message: string, ...optionalParams: any[]): void {
    this._logger.log('trace', message, ...optionalParams);
  }

  public debug(message: string, ...optionalParams: any[]): void {
    this._logger.log('debug', message, ...optionalParams);
  }

  public info(message: string, ...optionalParams: any[]): void {
    this._logger.log('info', message, ...optionalParams);
  }

  public warn(message: string, ...optionalParams: any[]): void {
    this._logger.log('warn', message, ...optionalParams);
  }

  public error(message: string, ...optionalParams: any[]): void {
    this._logger.log('error', message, ...optionalParams);
  }

  public setLevel(level: Level): void {
    this._loggerOptions.level = level;
  }

  public setFormat(format: Format): void {
    switch (format) {
      case Format.Simple:
        this._loggerOptions.format = winston.format.simple();
        break;
      case Format.Json:
        this._loggerOptions.format = winston.format.json();
    }
  }

  public setSink(sink: Sink): void {
    this._loggerOptions.transports = this.getSinkTransport(sink);
  }

  private getSinkTransport(sink: Sink): winston.transport {
    switch (sink) {
      case Sink.Console:
        return new winston.transports.Console();
      default:
        throw new Error('Invalid sink specified');
    }
  }
}

export function createLoggerBuilderFactory(
  config?: LoggingConfiguration,
  customLogger?: LoggerBuilder
): LoggerBuilder {
  if (customLogger) {
    // If a custom logger is provided, return it
    return customLogger;
  } else {
    // If no custom logger is provided, create and return the default Winston logger
    const logger = new DefaultLoggerBuilder();
    if (config) {
      logger.setLevel(config.level);
      logger.setFormat(config.format);
      logger.setSink(config.sink);
      logger.create(); // Create the logger
    }
    return logger;
  }
}
