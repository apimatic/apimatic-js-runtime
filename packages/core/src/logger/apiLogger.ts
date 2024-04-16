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
import { LoggingOptions } from './loggerConfiguration';
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

    if (this._loggingOptions.logRequest) {
      const {
        logBody,
        logHeaders,
        headerToInclude,
        headerToExclude,
      } = this._loggingOptions.logRequest;

      if (logHeaders) {
        const headersToLog = this.extractHeadersToLog(
          request.headers,
          headerToInclude,
          headerToExclude
        );

        this._loggingOptions.logger?.log(
          logLevel,
          `Request Headers ${headersToLog}`,
          {
            headers: headersToLog,
          }
        );
      }

      if (logBody) {
        this._loggingOptions.logger?.log(
          logLevel,
          `Request Body ${request.body}`,
          {
            body: request.body,
          }
        );
      }
    }
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

    if (this._loggingOptions.logResponse) {
      const {
        logBody,
        logHeaders,
        headerToInclude,
        headerToExclude,
      } = this._loggingOptions.logResponse;

      if (logHeaders) {
        const headersToLog = this.extractHeadersToLog(
          response.headers,
          headerToInclude,
          headerToExclude
        );

        this._logger.log(logLevel, `Response Headers ${headersToLog}`, {
          headers: headersToLog,
        });
      }

      if (logBody) {
        this._logger.log(logLevel, `Response Body ${response.body}`, {
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
