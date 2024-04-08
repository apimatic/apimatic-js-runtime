import { LoggingOptions } from './loggerOptions';
import { LoggerInterface, Level } from '../coreInterfaces';
import { HeaderLoggingPolicy } from './loggerConfiguration';

export class NullLogger implements LoggerInterface {
  public log(_level: Level, _message: string, ..._optionalParams: any[]): void {
    return;
  }
}

/** None authentication provider */
export const noneLoggerProvider: LoggingOptions = {
  enabled: false,
  logger: new NullLogger(),
  loggingConfig: {
    isLoggingRequestInfo: false,
    isLoggingRequestHeaders: false,
    isLoggingRequestBody: false,
    isLoggingResponseInfo: false,
    isLoggingResponseHeaders: false,
    isLoggingResponseBody: false,
    headerLoggingPolicy: HeaderLoggingPolicy.Exculde,
    headerFilters: []
  },
};
