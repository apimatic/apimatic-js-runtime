export class LoggerConfiguration {
  public isLoggingRequestInfo: boolean;
  public isLoggingRequestHeaders: boolean;
  public isLoggingRequestBody: boolean;
  public isLoggingResponseInfo: boolean;
  public isLoggingResponseHeaders: boolean;
  public isLoggingResponseBody: boolean;
  public headerFilters: string[];
  public headerLoggingPolicy: HeaderLoggingPolicy;

  public constructor() {
    this.isLoggingRequestInfo = false;
    this.isLoggingRequestHeaders = false;
    this.isLoggingRequestBody = false;
    this.isLoggingResponseInfo = false;
    this.isLoggingResponseHeaders = false;
    this.isLoggingResponseBody = false;
    this.headerLoggingPolicy = HeaderLoggingPolicy.Exculde;
    this.headerFilters = [];
  }

  public withLogEverything(): LoggerConfiguration {
    this.isLoggingRequestInfo = true;
    this.isLoggingRequestHeaders = true;
    this.isLoggingRequestBody = true;
    this.isLoggingResponseInfo = true;
    this.isLoggingResponseHeaders = true;
    this.isLoggingResponseBody = true;
    return this;
  }

  public withLogNothing(): LoggerConfiguration {
    this.isLoggingRequestInfo = false;
    this.isLoggingRequestHeaders = false;
    this.isLoggingRequestBody = false;
    this.isLoggingResponseInfo = false;
    this.isLoggingResponseHeaders = false;
    this.isLoggingResponseBody = false;
    return this;
  }

  public withPrettyPrintLogs(): LoggerConfiguration {
    return this;
  }

  public withHeaderLoggingPolicy(
    headerLoggingPolicy: HeaderLoggingPolicy
  ): LoggerConfiguration {
    this.headerLoggingPolicy = headerLoggingPolicy;
    return this;
  }

  public withAddHeaderFilter(...headerFilter: string[]): LoggerConfiguration {
    this.headerFilters = headerFilter;
    return this;
  }

  public withClearHeaderFilter(): LoggerConfiguration {
    this.headerFilters = [];
    return this;
  }
}

export enum HeaderLoggingPolicy {
  Include = 'include',
  Exculde = 'exclude',
}
