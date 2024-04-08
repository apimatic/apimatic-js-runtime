import { Level, LoggerInterface } from '../coreInterfaces';
import { HeaderLoggingPolicy, LoggingConfiguration } from './loggerConfiguration';
import { noneLoggerProvider } from './nullLogger';

export interface LoggingOptions {
  logger?: LoggerInterface;
  loggingConfig?: LoggingConfiguration;
  enabled: boolean;
}

export function customLoggerProvider(  // move this to SDK Side.
  loggingOp?: LoggingOptions
): LoggingOptions {
  if (loggingOp && loggingOp.enabled) {

    // settingUp default logger
    if (!loggingOp.logger){
      loggingOp.logger = new ConsoleLogger();
    }
    
    // settingUp default logging Configurations
    if (!loggingOp.loggingConfig){
      loggingOp.loggingConfig = {
        isLoggingRequestInfo: false,
        isLoggingRequestHeaders: false,
        isLoggingRequestBody: false,
        isLoggingResponseInfo: false,
        isLoggingResponseHeaders: false,
        isLoggingResponseBody: false,
        headerLoggingPolicy: HeaderLoggingPolicy.Exculde,
        headerFilters: []
      }
    }

    return loggingOp;
  } else {
    return noneLoggerProvider;
  }
}

export class ConsoleLogger implements LoggerInterface {
  public log(_level: Level, message: string, ...optionalParams: any[]): void {
    // tslint:disable-next-line:no-console
    console.log(message, optionalParams);
  }
}