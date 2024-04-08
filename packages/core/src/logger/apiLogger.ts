import { HttpRequest, HttpResponse, ApiLoggerInterface, LoggerInterface, Level } from '../coreInterfaces';
import { LoggingOptions } from './loggerOptions';
import { NullLogger } from './nullLogger';

export class ApiLogger implements ApiLoggerInterface {
  private readonly _logger: LoggerInterface;

  constructor(loggingOp: LoggingOptions) {
    this._logger = loggingOp.logger ?? new NullLogger();;
  }

  public logRequest(coreRequest: HttpRequest): void {
    // Method
    //     Url
    // Protocol (http/https)
    // TryCount
    //     Content Length
    //     Request Headers
    //     Request Body (configurable and give some warning in logs if enabled)
    const logLevel = Level.Info;
    this._logger.log(
      logLevel,
      'Request {HttpMethod} {Url}',
      coreRequest.method,
      coreRequest.url
    );

    const message = 'Request {request.HttpMethod} {request.QueryUrl} ';
    this._logger.log(logLevel, message);
  }

  public logResponse(coreResponse: HttpResponse): void {
    // Content Length
    // Response headers
    // Url
    //     Duration
    // Response Body (configurable and give some warning in logs if enabled)
    const logLevel = Level.Info;
    this._logger.log(
      logLevel,
      'Response {HttpStatusCode} {Length}',
      coreResponse.statusCode,
      coreResponse.body.toString().length
    );
  }
}

export const requestLoggerInterceptor = (apiLogger: ApiLoggerInterface) => {
  return (request, options, next) => {
    apiLogger.logRequest(request);
    return next(request, options);
  };
}

export const responseLoggerInterceptor = (apiLogger: ApiLoggerInterface) => {
  return (context) => {
    apiLogger.logResponse(context);
    return context;
  };
}
