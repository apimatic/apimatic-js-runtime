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
