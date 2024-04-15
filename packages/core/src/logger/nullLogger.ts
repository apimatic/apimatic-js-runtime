import { LoggerInterface, Level } from '../coreInterfaces';

export class NullLogger implements LoggerInterface {
  public log(
    _level: Level,
    _message: string,
    _params: Record<string, any>
  ): void {
    return;
  }
}
