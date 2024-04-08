export interface LoggingConfiguration {
  isLoggingRequestInfo: boolean;
  isLoggingRequestHeaders: boolean;
  isLoggingRequestBody: boolean;
  isLoggingResponseInfo: boolean;
  isLoggingResponseHeaders: boolean;
  isLoggingResponseBody: boolean;
  headerFilters: string[];
  headerLoggingPolicy: HeaderLoggingPolicy;
}


export enum HeaderLoggingPolicy {
  Include = 'include',
  Exculde = 'exclude',
}

/*
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
*/

