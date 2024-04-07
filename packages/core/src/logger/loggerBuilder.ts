import winston, { Logform, LoggerOptions } from 'winston';
import { Logger } from './winstonLoggerAdapter';

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

export interface LoggingConfiguration {
  isLoggingRequestInfo: boolean;
  isLoggingRequestHeaders: boolean;
  isLoggingRequestBody: boolean;
  isLoggingResponseInfo: boolean;
  isLoggingResponseHeaders: boolean;
  isLoggingResponseBody: boolean;
  isPrettyPrinting: boolean;
  headerFilters: string[];
  headerLoggingPolicy: HeaderLoggingPolicy;
  level: Level;
}

export interface LoggerBuilder {
  setLevel(level: string): void;
  setFormat(format: Format): void;
  setSink(sink: Sink): void;
}

export class DefaultLoggerBuilder implements LoggerBuilder {
  private _level: string;
  private _format: Logform.Format;
  private _sink: winston.transport;

  constructor() {
    this._level = 'info';
    this._format = winston.format.simple();
    this._sink = new winston.transports.Console();
  }

  public setLevel(level: Level): void {
    this._level = level;
  }

  public setFormat(format: Format): void {
    switch (format) {
      case Format.Simple:
        this._format = winston.format.simple();
        break;
      case Format.Json:
        this._format = winston.format.json();
    }
  }

  public setSink(sink: Sink): void {
    switch (sink) {
      case Sink.Console:
        this._sink = new winston.transports.Console();
        break;
    }
  }

  public createLogger(): winston.Logger {
    const options: LoggerOptions = {
      level: this._level,
      format: this._format,
      transports: [this._sink],
    };
    return winston.createLogger(options);
  }
}

export function createLoggerBuilderFactory(customLogger?: Logger): Logger {
  if (customLogger) {
    // If a custom logger is provided, return it
    return customLogger;
  } else {
    // If no custom logger is provided, create and return the default Winston logger
    const defaultLoggerBuilder = new DefaultLoggerBuilder();
    const winstonLogger = defaultLoggerBuilder.createLogger();
    return new WinstonLoggerAdapter(winstonLogger);
  }
}
