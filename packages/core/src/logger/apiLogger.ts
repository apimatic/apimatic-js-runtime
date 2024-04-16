import {
  HttpRequest,
  HttpResponse,
  ApiLoggerInterface,
  LoggerInterface,
  Level,
} from '../coreInterfaces';
import {
  CONTENT_LENGTH_HEADER,
  CONTENT_TYPE_HEADER,
  getHeader,
} from '../http/httpHeaders';
import {
  LogBaseOptions,
  LoggingOptions,
  LogRequestOptions,
} from './loggerConfiguration';
import { NullLogger } from './nullLogger';

export class ApiLogger implements ApiLoggerInterface {
  private readonly _loggingOptions: LoggingOptions;
  private readonly _isConfigured: boolean;
  private readonly _logger: LoggerInterface;

  constructor(loggingOpt: LoggingOptions) {
    this._loggingOptions = loggingOpt;
    this._logger = loggingOpt.logger ?? new NullLogger();
    this._isConfigured = this._logger !== new NullLogger() ? true : false;
  }

  public logRequest(request: HttpRequest): void {
    if (!this._isConfigured) {
      return;
    }

    const logLevel = this._loggingOptions.logLevel ?? Level.Info;
    const contentTypeHeader = this.getContentType(request.headers);
    const url = this._loggingOptions.logRequest?.includeQueryInPath
      ? request.url
      : this.removeQueryParams(request.url);

    this._logger.log(
      logLevel,
      `$Request  HttpMethod: ${request.method} Url: ${url} ContentType: ${contentTypeHeader}`,
      {
        method: request.method,
        url,
        contentType: contentTypeHeader,
      }
    );
    this.applyLogRequestOptions(
      logLevel,
      request,
      this._loggingOptions.logRequest
    );
  }

  public logResponse(response: HttpResponse): void {
    if (!this._isConfigured) {
      return;
    }

    const logLevel = this._loggingOptions.logLevel ?? Level.Info;
    const contentTypeHeader = this.getContentType(response.headers);
    const contentLengthHeader = this.getContentLength(response.headers);

    this._logger.log(
      logLevel,
      `Response HttpStatusCode ${response.statusCode} Length ${contentLengthHeader} ContentType ${contentTypeHeader}`,
      {
        statusCode: response.statusCode,
        contentLength: contentLengthHeader,
        contentType: contentTypeHeader,
      }
    );

    this.applyLogResponseOptions(
      logLevel,
      response,
      this._loggingOptions.logRequest
    );
  }

  private applyLogRequestOptions(
    level: Level,
    request: HttpRequest,
    logRequest?: LogRequestOptions
  ) {
    if (logRequest) {
      const {
        logBody,
        logHeaders,
        headerToInclude,
        headerToExclude,
      } = logRequest;

      if (logHeaders) {
        const headersToLog = this.extractHeadersToLog(
          request.headers,
          headerToInclude,
          headerToExclude
        );

        this._loggingOptions.logger?.log(
          level,
          `Request Headers ${headersToLog}`,
          {
            headers: headersToLog,
          }
        );
      }

      if (logBody) {
        this._loggingOptions.logger?.log(
          level,
          `Request Body ${request.body}`,
          {
            body: request.body,
          }
        );
      }
    }
  }

  private applyLogResponseOptions(
    level: Level,
    response: HttpResponse,
    logResponse?: LogBaseOptions
  ) {
    if (logResponse) {
      const {
        logBody,
        logHeaders,
        headerToInclude,
        headerToExclude,
      } = logResponse;

      if (logHeaders) {
        const headersToLog = this.extractHeadersToLog(
          response.headers,
          headerToInclude,
          headerToExclude
        );

        this._logger.log(level, `Response Headers ${headersToLog}`, {
          headers: headersToLog,
        });
      }

      if (logBody) {
        this._logger.log(level, `Response Body ${response.body}`, {
          body: response.body,
        });
      }
    }
  }

  private getContentType(headers?: Record<string, string>): string {
    return headers ? getHeader(headers, CONTENT_TYPE_HEADER) ?? '' : '';
  }

  private getContentLength(headers?: Record<string, string>): string {
    return headers ? getHeader(headers, CONTENT_LENGTH_HEADER) ?? '' : '';
  }

  private removeQueryParams(url: string): string {
    const queryStringIndex: number = url.indexOf('?');
    return queryStringIndex !== -1 ? url.substring(0, queryStringIndex) : url;
  }

  private extractHeadersToLog(
    headers?: Record<string, string>,
    headersToInclude?: string[],
    headersToExclude?: string[]
  ): Record<string, string> {
    if (!headers) {
      return {};
    }

    if (headersToInclude && headersToInclude.length > 0) {
      // Filter headers based on the keys specified in headersToInclude
      const filteredHeaders = Object.entries(headers)
        .filter(([key]) => headersToInclude.includes(key))
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});

      return filteredHeaders;
    }

    if (headersToExclude && headersToExclude.length > 0) {
      // Filter headers based on the keys specified in headersToExclude
      const filteredHeaders = Object.entries(headers)
        .filter(([key]) => !headersToExclude.includes(key))
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});

      return filteredHeaders;
    }

    return headers;
  }
}
