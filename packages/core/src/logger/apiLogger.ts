import {
  HttpRequest,
  HttpResponse,
  ApiLoggerInterface,
  LoggerInterface,
  Level,
} from '../coreInterfaces';
import { LoggingOptions } from './loggerOptions';
import { NullLogger } from './nullLogger';

export class ApiLogger implements ApiLoggerInterface {
  private readonly _logger: LoggerInterface;

  constructor(loggingOp: LoggingOptions) {
    this._logger = loggingOp.logger ?? new NullLogger();
  }

  public logRequest(coreRequest: HttpRequest): void {
    this._logger.log(
      Level.Info,
      'Request ',
      { HttpMethod: coreRequest.method },
      { Url: coreRequest.url }
    );
  }

  public logResponse(coreResponse: HttpResponse): void {
    this._logger.log(
      Level.Info,
      'Response ',
      { HttpStatusCode: coreResponse.statusCode },
      { bodyLength: coreResponse.body.toString().length }
    );
  }
}

export const requestLoggerInterceptor = (apiLogger: ApiLoggerInterface) => {
  return (request, options, next) => {
    apiLogger.logRequest(request);
    return next(request, options);
  };
};

export const responseLoggerInterceptor = (apiLogger: ApiLoggerInterface) => {
  return (context) => {
    apiLogger.logResponse(context);
    return context;
  };
};
