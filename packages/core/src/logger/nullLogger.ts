import { LoggerInterface, LogLevel } from '../coreInterfaces';

export class NullLogger implements LoggerInterface {
  public log(
    _level: LogLevel,
    _message: string,
    _params: Record<string, any>
  ): void {
    return;
  }
}
