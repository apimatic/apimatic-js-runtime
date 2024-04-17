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
    this._isConfigured = this._logger && this._logger !== new NullLogger();
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
      'Request  HttpMethod: ${method} Url: ${url} ContentType: ${contentType}',
      {
        method: request.method,
        url,
        contentType: contentTypeHeader,
      }
    );

    this.applyLogRequestOptions(logLevel, request);
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
      'Response HttpStatusCode: ${statusCode} Length: ${contentLength} ContentType: ${contentType}',
      {
        statusCode: response.statusCode,
        contentLength: contentLengthHeader,
        contentType: contentTypeHeader,
      }
    );

    this.applyLogResponseOptions(logLevel, response);
  }

  private applyLogRequestOptions(level: Level, request: HttpRequest) {
    this.applyLogRequestHeaders(
      level,
      request,
      this._loggingOptions.logRequest
    );

    this.applyLogRequestBody(level, request, this._loggingOptions.logRequest);
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

        this._loggingOptions.logger?.log(level, 'Request Headers: ${headers}', {
          headers: headersToLog,
        });
      }
    }
  }

  private applyLogRequestBody(
    level: Level,
    request: HttpRequest,
    logRequest?: HttpRequestLoggingOptions
  ) {
    if (logRequest?.logBody) {
      this._loggingOptions.logger?.log(level, 'Request Body: ${body}', {
        body: request.body,
      });
    }
  }

  private applyLogResponseOptions(level: Level, response: HttpResponse) {
    this.applyLogResponseHeaders(
      level,
      response,
      this._loggingOptions.logResponse
    );

    this.applyLogResponseBody(
      level,
      response,
      this._loggingOptions.logResponse
    );
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

        this._logger.log(level, 'Response Headers: ${headers}', {
          headers: headersToLog,
        });
      }
    }
  }

  private applyLogResponseBody(
    level: Level,
    response: HttpResponse,
    logResponse?: HttpMessageLoggingOptions
  ) {
    if (logResponse?.logBody) {
      this._logger.log(level, 'Response Body: ${body}', {
        body: response.body,
      });
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
      return this.includeHeadersToLog(
        headers,
        filteredHeaders,
        headersToInclude
      );
    }

    if (headersToExclude && headersToExclude.length > 0) {
      return this.excludeHeadersToLog(
        headers,
        filteredHeaders,
        headersToExclude
      );
    }

    return this.removeSenstiveHeaders(headers);
  }

  private includeHeadersToLog(
    headers: Record<string, string>,
    filteredHeaders: Record<string, string>,
    headersToInclude?: string[]
  ): Record<string, string> {
    // Filter headers based on the keys specified in headersToInclude
    headersToInclude?.forEach((name) => {
      const val = getHeader(headers, name);
      if (val !== null) {
        filteredHeaders[name] = val;
      }
    });
    return this.removeSenstiveHeaders(filteredHeaders);
  }

  private excludeHeadersToLog(
    headers: Record<string, string>,
    filteredHeaders: Record<string, string>,
    headersToExclude?: string[]
  ): Record<string, string> {
    // Filter headers based on the keys specified in headersToExclude
    for (const key of Object.keys(headers)) {
      if (
        !headersToExclude?.some(
          (excludedName) => excludedName.toLowerCase() === key.toLowerCase()
        )
      ) {
        filteredHeaders[key] = headers[key];
      }
    }
    return this.removeSenstiveHeaders(filteredHeaders);
  }

  private removeSenstiveHeaders(
    headers: Record<string, string>
  ): Record<string, string> {
    if (this._loggingOptions.maskSensitiveHeaders) {
      const senstiveHeaders = [
        'Authorization',
        'WWW-Authenticate',
        'Proxy-Authorization',
        'Set-Cookie',
      ];
      for (const key of Object.keys(headers)) {
        if (getHeader(headers, key) !== null && senstiveHeaders.includes(key)) {
          headers[key] = '**Redacted**';
        }
      }
    }
    return headers;
  }
}
