import {
  HttpRequest,
  HttpResponse,
  ApiLoggerInterface,
  LoggerInterface,
  Level,
} from '../coreInterfaces';
import { CONTENT_LENGTH_HEADER, getHeader } from '../http/httpHeaders';

export class ApiLogger implements ApiLoggerInterface {
  private readonly _logger: LoggerInterface;

  constructor(logger: LoggerInterface) {
    this._logger = logger;
  }

  public logRequest(request: HttpRequest): void {
    this._logger.log(
      Level.Info,
      `Request ${request.method} ${request.url}`,
      { method: request.method, url: request.url } // move to one object and
    );
  }

  public logResponse(response: HttpResponse): void {
    const contentLength = getHeader(response.headers, CONTENT_LENGTH_HEADER);

    this._logger.log(
      Level.Info,
      `Response ${response.statusCode} ${contentLength}`,
      { statusCode: response.statusCode, contentLength }
    );
  }
}
