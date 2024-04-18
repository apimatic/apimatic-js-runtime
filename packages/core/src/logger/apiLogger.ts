import {
  HttpRequest,
  HttpResponse,
  ApiLoggerInterface,
  LoggerInterface,
  LoggingOptions,
  HttpRequestLoggingOptions,
  HttpMessageLoggingOptions,
  LogLevel,
} from '../coreInterfaces';
import {
  CONTENT_LENGTH_HEADER,
  CONTENT_TYPE_HEADER,
  getHeader,
} from '../http/httpHeaders';
import { NullLogger } from './nullLogger';

export class ApiLogger implements ApiLoggerInterface {
  private readonly _loggingOptions: LoggingOptions;
  private readonly _logger: LoggerInterface;

  constructor(loggingOpt: LoggingOptions) {
    this._loggingOptions = loggingOpt;
    this._logger = loggingOpt.logger ?? new NullLogger();
  }

  public logRequest(request: HttpRequest): void {
    const logLevel = this._loggingOptions.logLevel ?? LogLevel.Info;
    const contentTypeHeader = this._getContentType(request.headers);
    const url = this._loggingOptions.logRequest?.includeQueryInPath
      ? request.url
      : this._removeQueryParams(request.url);

    this._logger.log(
      logLevel,
      'Request  HttpMethod: ${method} Url: ${url} ContentType: ${contentType}',
      {
        method: request.method,
        url,
        contentType: contentTypeHeader,
      }
    );

    this._applyLogRequestOptions(logLevel, request);
  }

  public logResponse(response: HttpResponse): void {
    const logLevel = this._loggingOptions.logLevel ?? LogLevel.Info;
    const contentTypeHeader = this._getContentType(response.headers);
    const contentLengthHeader = this._getContentLength(response.headers);

    this._logger.log(
      logLevel,
      'Response HttpStatusCode: ${statusCode} Length: ${contentLength} ContentType: ${contentType}',
      {
        statusCode: response.statusCode,
        contentLength: contentLengthHeader,
        contentType: contentTypeHeader,
      }
    );

    this._applyLogResponseOptions(logLevel, response);
  }

  private _applyLogRequestOptions(level: LogLevel, request: HttpRequest) {
    this._applyLogRequestHeaders(
      level,
      request,
      this._loggingOptions.logRequest
    );

    this._applyLogRequestBody(level, request, this._loggingOptions.logRequest);
  }

  private _applyLogRequestHeaders(
    level: LogLevel,
    request: HttpRequest,
    logRequest: HttpRequestLoggingOptions
  ) {
    const { logHeaders, headerToInclude, headerToExclude } = logRequest;

    if (logHeaders) {
      const headersToLog = this._extractHeadersToLog(
        request.headers,
        headerToInclude,
        headerToExclude
      );

      this._logger?.log(level, 'Request Headers: ${headers}', {
        headers: headersToLog,
      });
    }
  }

  private _applyLogRequestBody(
    level: LogLevel,
    request: HttpRequest,
    logRequest: HttpRequestLoggingOptions
  ) {
    if (logRequest.logBody) {
      this._logger?.log(level, 'Request Body: ${body}', {
        body: request.body,
      });
    }
  }

  private _applyLogResponseOptions(level: LogLevel, response: HttpResponse) {
    this._applyLogResponseHeaders(
      level,
      response,
      this._loggingOptions.logResponse
    );

    this._applyLogResponseBody(
      level,
      response,
      this._loggingOptions.logResponse
    );
  }

  private _applyLogResponseHeaders(
    level: LogLevel,
    response: HttpResponse,
    logResponse: HttpMessageLoggingOptions
  ) {
    const { logHeaders, headerToInclude, headerToExclude } = logResponse;

    if (logHeaders) {
      const headersToLog = this._extractHeadersToLog(
        response.headers,
        headerToInclude,
        headerToExclude
      );

      this._logger.log(level, 'Response Headers: ${headers}', {
        headers: headersToLog,
      });
    }
  }

  private _applyLogResponseBody(
    level: LogLevel,
    response: HttpResponse,
    logResponse: HttpMessageLoggingOptions
  ) {
    if (logResponse.logBody) {
      this._logger.log(level, 'Response Body: ${body}', {
        body: response.body,
      });
    }
  }

  private _getContentType(headers?: Record<string, string>): string {
    return headers ? getHeader(headers, CONTENT_TYPE_HEADER) ?? '' : '';
  }

  private _getContentLength(headers?: Record<string, string>): string {
    return headers ? getHeader(headers, CONTENT_LENGTH_HEADER) ?? '' : '';
  }

  private _removeQueryParams(url: string): string {
    const queryStringIndex: number = url.indexOf('?');
    return queryStringIndex !== -1 ? url.substring(0, queryStringIndex) : url;
  }

  private _extractHeadersToLog(
    headers?: Record<string, string>,
    headersToInclude?: string[],
    headersToExclude?: string[]
  ): Record<string, string> {
    const filteredHeaders: Record<string, string> = {};
    if (!headers) {
      return {};
    }

    if (headersToInclude && headersToInclude.length > 0) {
      return this._includeHeadersToLog(
        headers,
        filteredHeaders,
        headersToInclude
      );
    }

    if (headersToExclude && headersToExclude.length > 0) {
      return this._excludeHeadersToLog(
        headers,
        filteredHeaders,
        headersToExclude
      );
    }

    return this._filterSenstiveHeaders(headers);
  }

  private _includeHeadersToLog(
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
    return this._filterSenstiveHeaders(filteredHeaders);
  }

  private _excludeHeadersToLog(
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
    return this._filterSenstiveHeaders(filteredHeaders);
  }

  private _filterSenstiveHeaders(
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
        if (
          getHeader(headers, key) !== null &&
          senstiveHeaders.includes(key.toUpperCase())
        ) {
          headers[key] = '**Redacted**';
        }
      }
    }
    return headers;
  }
}
