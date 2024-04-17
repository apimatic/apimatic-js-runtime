import {
  HttpRequest,
  HttpResponse,
  ApiLoggerInterface,
  LoggerInterface,
  LoggingOptions,
  HttpRequestLoggingOptions,
  HttpMessageLoggingOptions,
  Level,
} from '../coreInterfaces';
import {
  CONTENT_LENGTH_HEADER,
  CONTENT_TYPE_HEADER,
  getHeader,
} from '../http/httpHeaders';
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
      `Request  HttpMethod: ${request.method} Url: ${url} ContentType: ${contentTypeHeader}`,
      {
        method: request.method,
        url,
        contentType: contentTypeHeader,
      }
    );
    this.applyLogRequestHeaders(
      logLevel,
      request,
      this._loggingOptions.logRequest
    );

    this.applyLogRequestBody(
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

    this.applyLogResponseHeaders(
      logLevel,
      response,
      this._loggingOptions.logResponse
    );

    this.applyLogResponseBody(
      logLevel,
      response,
      this._loggingOptions.logResponse
    );
  }

  private applyLogRequestHeaders(
    level: Level,
    request: HttpRequest,
    logRequest?: HttpRequestLoggingOptions
  ) {
    if (logRequest) {
      const { logHeaders, headerToInclude, headerToExclude } = logRequest;

      if (logHeaders) {
        const headersToLog = this.extractHeadersToLog(
          request.headers,
          headerToInclude,
          headerToExclude
        );

        this._loggingOptions.logger?.log(
          level,
          `Request Headers ${JSON.stringify(headersToLog)}`,
          {
            headers: headersToLog,
          }
        );
      }
    }
  }

  private applyLogRequestBody(
    level: Level,
    request: HttpRequest,
    logRequest?: HttpRequestLoggingOptions
  ) {
    if (logRequest?.logBody) {
      this._loggingOptions.logger?.log(
        level,
        `Request Body ${JSON.stringify(request.body)}`,
        {
          body: request.body,
        }
      );
    }
  }

  private applyLogResponseHeaders(
    level: Level,
    response: HttpResponse,
    logResponse?: HttpMessageLoggingOptions
  ) {
    if (logResponse) {
      const { logHeaders, headerToInclude, headerToExclude } = logResponse;

      if (logHeaders) {
        const headersToLog = this.extractHeadersToLog(
          response.headers,
          headerToInclude,
          headerToExclude
        );

        this._logger.log(
          level,
          `Response Headers ${JSON.stringify(headersToLog)}`,
          {
            headers: headersToLog,
          }
        );
      }
    }
  }

  private applyLogResponseBody(
    level: Level,
    response: HttpResponse,
    logResponse?: HttpMessageLoggingOptions
  ) {
    if (logResponse?.logBody) {
      this._logger.log(
        level,
        `Response Body ${JSON.stringify(response.body)}`,
        {
          body: response.body,
        }
      );
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
    const filteredHeaders: Record<string, string> = {};
    if (!headers) {
      return {};
    }

    if (headersToInclude && headersToInclude.length > 0) {
      // Filter headers based on the keys specified in headersToInclude
      headersToInclude.forEach((name) => {
        const val = getHeader(headers, name);
        if (val !== null) {
          filteredHeaders[name] = val;
        }
      });

      return filteredHeaders;
    }

    if (headersToExclude && headersToExclude.length > 0) {
      // Filter headers based on the keys specified in headersToExclude
      for (const key of Object.keys(headers)) {
        if (
          !headersToExclude.some(
            (excludedName) => excludedName.toLowerCase() === key.toLowerCase()
          )
        ) {
          filteredHeaders[key] = headers[key];
        }
      }

      return filteredHeaders;
    }

    return headers;
  }
}
