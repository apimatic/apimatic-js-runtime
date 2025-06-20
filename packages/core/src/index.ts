// tslint:disable-next-line:no-reference
/// <reference path='./shim/index.ts' />

export * from './apiHelper';
export * from './coreInterfaces';
export * from './fileWrapper';
export * from './errors/abortError';
export * from './errors/argumentsValidationError';
export * from './errors/responseValidationError';
export * from './errors/apiError';
export * from './http/httpHeaders';
export * from './http/httpInterceptor';
export * from './http/requestBuilder';
export * from './http/pathTemplate';
export { RequestRetryOption } from './http/retryConfiguration';
export * from './logger/apiLogger';
export * from './logger/defaultLogger';
export * from './logger/nullLogger';
export * from './logger/defaultLoggingConfiguration';
export * from './logger/loggingOptions';
export {
  indexedPrefix,
  unindexedPrefix,
  plainPrefix,
  commaPrefix,
  tabPrefix,
  pipePrefix,
} from './http/queryString';
export { XmlSerializerInterface } from './xml/xmlSerializer';
export { OffsetPagination } from './paginator/offsetPagination';
export { CursorPagination } from './paginator/cursorPagination';
export { PagePagination } from './paginator/pagePagination';
export { LinkPagination } from './paginator/linkPagination';
export {
  createOffsetPagedResponse,
  isOffsetPagedResponse,
  OffsetPagedResponse,
} from './paginator/offsetPagedResponse';
export {
  createCursorPagedResponse,
  CursorPagedResponse,
  isCursorPagedResponse,
} from './paginator/cursorPagedResponse';
export {
  createLinkPagedResponse,
  isLinkPagedResponse,
  LinkPagedResponse,
} from './paginator/linkPagedResponse';
export {
  createNumberPagedResponse,
  isNumberPagedResponse,
  NumberPagedResponse,
} from './paginator/numberPagedResponse';
export { PagedResponse } from './paginator/pagedResponse';
export { PagedAsyncIterable, PagedData } from './paginator/pagedData';
