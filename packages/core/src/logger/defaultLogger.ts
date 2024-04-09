import { Level, LoggerInterface } from '@apimatic/core-interfaces';

export class ConsoleLogger implements LoggerInterface {
  public log(level: Level, message: string, ...params: any[]): void {
    // tslint:disable-next-line:no-console
    console.log('level : ' + level + ', message : ' + message, params);
  }
}
