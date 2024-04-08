import { ILogger, Level, LoggerBuilder } from './loggerBuilder';
import { LoggerConfiguration } from './loggerConfiguration';

export class NullLogger implements ILogger {
  public log(_level: Level, _message: string, ..._optionalParams: any[]): void {
    return;
  }
}

/** None authentication provider */
export const noneLoggerProvider: LoggerBuilder = {
  _logger: new NullLogger(),
  _loggerConfig: new LoggerConfiguration(),
};
