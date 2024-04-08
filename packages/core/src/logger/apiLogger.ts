import { ILogger, Level } from './loggerBuilder';
import { HttpRequest, HttpResponse } from '../coreInterfaces';

export class ApiLogger {
  private readonly _logger: ILogger;

  constructor(logger: ILogger) {
    this._logger = logger;
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

/*
    this._addLoggerInterceptor();

  private _addLoggerInterceptor() {
    this.interceptRequest((request) => {
      if (this._loggerBuilder._loggerConfig.isLoggingRequestBody) {
        this._loggerBuilder._logger.log(
          Level.Info,
          'Request Body',
          request.body
        );
      }

      if (this._loggerBuilder._loggerConfig.isLoggingRequestHeaders) {
        this._loggerBuilder._logger.log(
          Level.Info,
          'Request Headers',
          request.headers
        );
      }

      if (this._loggerBuilder._loggerConfig.isLoggingRequestInfo) {
        this._loggerBuilder._logger.log(Level.Info, 'Request Info', {
          method: request.method,
          url: request.url,
        });
      }
      return request;
    });

    this.interceptResponse((context) => {
      if (this._loggerBuilder._loggerConfig.isLoggingResponseBody) {
        this._loggerBuilder._logger.log(
          Level.Info,
          'Response Body',
          context.response.body
        );
      }

      if (this._loggerBuilder._loggerConfig.isLoggingResponseHeaders) {
        this._loggerBuilder._logger.log(
          Level.Info,
          'Response Headers',
          context.response.headers
        );
      }

      if (this._loggerBuilder._loggerConfig.isLoggingResponseInfo) {
        this._loggerBuilder._logger.log(
          Level.Info,
          'Response Info',
          context.response.statusCode
        );
      }
      return context;
    });
  }
  */
