import {
  HttpRequest,
  HttpResponse,
  ApiLoggerInterface,
  LoggerInterface,
  Level,
} from '../coreInterfaces';
import { CONTENT_LENGTH_HEADER, getHeader } from '../http/httpHeaders';
import { LoggingConfiguration } from './loggerConfiguration';

export class ApiLogger implements ApiLoggerInterface {
  private readonly _logger: LoggerInterface;
  private readonly _loggingConfig: LoggingConfiguration;

  constructor(logger: LoggerInterface, loggingConfig: LoggingConfiguration) {
    this._logger = logger;
    this._loggingConfig = loggingConfig;
  }

  public logRequest(scopeId: string, request: HttpRequest): void {
    this._logger.log(
      this._loggingConfig.level ?? Level.Info,
      `Request ${scopeId} ${request.method} ${request.url}`,
      { scopeId, method: request.method, url: request.url } // move to one object and
    );
  }

  public logResponse(scopeId: string, response: HttpResponse): void {
    const contentLength = getHeader(response.headers, CONTENT_LENGTH_HEADER);

    this._logger.log(
      this._loggingConfig.level ?? Level.Info,
      `Response ${scopeId} ${response.statusCode} ${contentLength}`,
      {
        scopeId,
        statusCode: response.statusCode,
        contentLength,
      }
    );
  }
}

export function generateGUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    /* tslint:disable:no-bitwise */
    const r = (Math.random() * 16) | 0;
    /* tslint:disable:no-bitwise */
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
