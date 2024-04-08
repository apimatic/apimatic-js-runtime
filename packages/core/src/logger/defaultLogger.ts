import { ILogger, Level } from './loggerBuilder';

export class ConsoleLogger implements ILogger {
  public log(_level: Level, message: string, ...optionalParams: any[]): void {
    // tslint:disable-next-line:no-console
    console.log(message, optionalParams);
  }
}
