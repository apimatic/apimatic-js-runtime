import {
  HttpRequest,
  HttpResponse,
  ApiLoggerInterface,
  LoggerInterface,
  Level,
} from '../coreInterfaces';

export class ApiLogger implements ApiLoggerInterface {
  private readonly _logger: LoggerInterface;

  constructor(logger: LoggerInterface) {
    this._logger = logger;
  }

  public logRequest(coreRequest: HttpRequest): void {
    this._logger.log(
      Level.Info,
      'Request ${method} ${url}',
      { method: coreRequest.method }, // move to one object and
      { url: coreRequest.url }
    );
  }

  public logResponse(coreResponse: HttpResponse): void {
    this._logger.log(
      Level.Info,
      'Response ${statusCode} ${bodyLength}',
      { statusCode: coreResponse.statusCode },
      { bodyLength: coreResponse.body.toString().length }
    );
  }
}
