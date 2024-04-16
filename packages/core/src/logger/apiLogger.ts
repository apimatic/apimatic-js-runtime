import {
  HttpRequest,
  HttpResponse,
  ApiLoggerInterface,
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
  private readonly _loggingOp: LoggingOptions;
  private readonly _isConfigured: boolean;

  constructor(loggingOp: LoggingOptions) {
    this._loggingOp = loggingOp;
    this._isConfigured = loggingOp.logger
      ? loggingOp.logger !== new NullLogger()
      : false;
  }

  public logRequest(scopeId: string, request: HttpRequest): void {
    if (!this._isConfigured) {
      return;
    }

    const localLogLevel = this._loggingOp.logLevel ?? Level.Info;
    const contentTypeHeader = this.getContentType(request.headers);
    const url = this._loggingOp.logRequest?.includeQueryInPath
      ? request.url
      : this.parseQueryPath(request.url);

    this._loggingOp.logger?.log(
      localLogLevel,
      `Request ${scopeId} ${request.method} ${url} ${contentTypeHeader}`,
      {
        scopeId,
        method: request.method,
        url,
        contentType: contentTypeHeader,
      }
    );

    if (this._loggingOp.logRequest?.logHeaders) {
      const headersToLog = this.extractHeadersToLog(
        request.headers,
        this._loggingOp.logRequest?.headerToInclude,
        this._loggingOp.logRequest?.headerToExclude
      );

      this._loggingOp.logger?.log(
        localLogLevel,
        `Request Headers ${scopeId} ${headersToLog}`,
        {
          scopeId,
          headers: headersToLog,
        }
      );
    }

    if (this._loggingOp.logRequest?.logBody) {
      this._loggingOp.logger?.log(
        localLogLevel,
        `Request Body ${scopeId} ${request.body}`,
        {
          scopeId,
          body: request.body,
        }
      );
    }
  }

  public logResponse(scopeId: string, response: HttpResponse): void {
    if (!this._isConfigured) {
      return;
    }

    const localLogLevel = this._loggingOp.logLevel ?? Level.Info;
    const contentTypeHeader = this.getContentType(response.headers);
    const contentLengthHeader = this.getContentLength(response.headers);

    this._loggingOp.logger?.log(
      localLogLevel,
      `Response ${scopeId} ${response.statusCode} ${contentLengthHeader} ${contentTypeHeader}`,
      {
        scopeId,
        statusCode: response.statusCode,
        contentLength: contentLengthHeader,
        contentType: contentTypeHeader,
      }
    );

    if (this._loggingOp.logResponse?.logHeaders) {
      const headersToLog = this.extractHeadersToLog(
        response.headers,
        this._loggingOp.logResponse?.headerToInclude,
        this._loggingOp.logResponse?.headerToExclude
      );

      this._loggingOp.logger?.log(
        localLogLevel,
        `Response Headers ${scopeId} ${headersToLog}`,
        {
          scopeId,
          headers: headersToLog,
        }
      );
    }

    if (this._loggingOp.logResponse?.logBody) {
      this._loggingOp.logger?.log(
        localLogLevel,
        `Response Body ${scopeId} ${response.body}`,
        {
          scopeId,
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

  private parseQueryPath(url: string): string {
    if (!url) {
      return url;
    }
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
      return headers;
      // .Where(h => headersToInclude.Contains(h.Key))
      // .ToDictionary(h => h.Key, h => h.Value);
    }

    if (headersToExclude && headersToExclude.length > 0) {
      return headers;
      // .Where(h => !headersToExclude.Contains(h.Key))
      // .ToDictionary(h => h.Key, h => h.Value);
    }

    return headers;
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
