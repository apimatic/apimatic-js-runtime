import { ConsoleLogger } from './defaultLogger';
import { LoggerConfiguration } from './loggerConfiguration';

export enum Level {
  Error = 'error',
  Warn = 'warn',
  Info = 'info',
  Debug = 'debug',
  Trace = 'trace',
}

export interface ILogger {
  log(level: Level, message: string, ...optionalParams: any[]): void;
}

export interface LoggerBuilder {
  _logger: ILogger;
  _loggerConfig: LoggerConfiguration;
}

export function customLoggerProvider(
  loggerBuilder?: LoggerBuilder
): LoggerBuilder {
  if (loggerBuilder) {
    return loggerBuilder;
  } else {
    const _loggerBuilder: LoggerBuilder = {
      _logger: new ConsoleLogger(),
      _loggerConfig: new LoggerConfiguration(),
    };
    return _loggerBuilder;
  }
}
