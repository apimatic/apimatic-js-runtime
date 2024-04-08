import { Level, LoggerInterface } from '../coreInterfaces';
import { LoggingConfiguration } from './loggerConfiguration';

export interface LoggingOptions {
  logger?: LoggerInterface;
  loggingConfig?: LoggingConfiguration;
  enabled: boolean;
}

export class ConsoleLogger implements LoggerInterface {
  public log(_level: Level, message: string, ...optionalParams: any[]): void {
    // tslint:disable-next-line:no-console
    console.log(message, optionalParams);
  }
}