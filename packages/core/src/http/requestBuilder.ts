import JSONBig from '@apimatic/json-bigint';
import { FileWrapper } from '@apimatic/file-wrapper';
import {
  deprecated,
  sanitizeUrl,
  updateErrorMessage,
  updateValueByJsonPointer,
} from '../apiHelper';
import {
  ApiResponse,
  AuthenticatorInterface,
  HttpContext,
  HttpMethod,
  HttpRequest,
  HttpInterceptorInterface,
  RequestOptions,
  RetryConfiguration,
  ApiLoggerInterface,
  HttpClientInterface,
} from '../coreInterfaces';
import { ArgumentsValidationError } from '../errors/argumentsValidationError';
import { ResponseValidationError } from '../errors/responseValidationError';
import {
  Schema,
  SchemaValidationError,
  validateAndMap,
  validateAndMapXml,
  validateAndUnmapXml,
} from '../schema';
import {
  ACCEPT_HEADER,
  CONTENT_LENGTH_HEADER,
  CONTENT_TYPE_HEADER,
  JSON_CONTENT_TYPE,
  mergeHeaders,
  setHeader,
  setHeaderIfNotSet,
  TEXT_CONTENT_TYPE,
  XML_CONTENT_TYPE,
} from './httpHeaders';
import { callHttpInterceptors } from './httpInterceptor';
import {
  pathTemplate,
  PathTemplatePrimitiveTypes,
  PathTemplateTypes,
  SkipEncode,
} from './pathTemplate';
import {
  filterFileWrapperFromKeyValuePairs,
  formDataEncodeObject,
  urlEncodeObject,
  ArrayPrefixFunction,
} from './queryString';
import { prepareArgs } from './validate';
import {
  getRetryWaitTime,
  shouldRetryRequest,
  RequestRetryOption,
} from './retryConfiguration';
import { convertToStream } from '@apimatic/convert-to-stream';
import { XmlSerializerInterface, XmlSerialization } from '../xml/xmlSerializer';

export type RequestBuilderFactory<BaseUrlParamType, AuthParams> = (
  httpMethod: HttpMethod,
  path?: string
) => RequestBuilder<BaseUrlParamType, AuthParams>;

const JSON = JSONBig();

export function skipEncode<T extends PathTemplatePrimitiveTypes>(
  value: T
): SkipEncode<T> {
  return new SkipEncode(value);
}

export type ApiErrorConstructor = new (
  response: HttpContext,
  message: string
) => any;

export interface ErrorType<ErrorCtorArgs extends any[]> {
  statusCode: number | [number, number];
  errorConstructor: new (response: HttpContext, ...args: ErrorCtorArgs) => any;
  isTemplate?: boolean;
  args: ErrorCtorArgs;
}

export interface ApiErrorFactory {
  apiErrorCtor: ApiErrorConstructor;
  message?: string | undefined;
}
export interface RequestBuilder<BaseUrlParamType, AuthParams> {
  deprecated(methodName: string, message?: string): void;
  prepareArgs: typeof prepareArgs;
  method(httpMethodName: HttpMethod): void;
  baseUrl(arg: BaseUrlParamType): void;
  authenticate(params: AuthParams): void;
  appendPath(path: string): void;
  appendTemplatePath(
    strings: TemplateStringsArray,
    ...args: PathTemplateTypes[]
  ): void;
  acceptJson(): void;
  accept(acceptHeaderValue: string): void;
  contentType(contentTypeHeaderValue: string): void;
  header(name: string, value?: unknown): void;
  headers(headersToMerge: Record<string, string>): void;
  query(
    name: string,
    value: unknown | Record<string, unknown>,
    prefixFormat?: ArrayPrefixFunction
  ): void;
  query(
    parameters?: Record<string, unknown> | null,
    prefixFormat?: ArrayPrefixFunction
  ): void;
  template(name: string, value: PathTemplateTypes): void;
  form(
    parameters: Record<string, unknown>,
    prefixFormat?: ArrayPrefixFunction
  ): void;
  formData(
    parameters: Record<string, unknown>,
    prefixFormat?: ArrayPrefixFunction
  ): void;
  updateParameterByJsonPointer(
    pointer: string | null,
    setter: (value: any) => any
  ): this;
  text(body: string | number | bigint | boolean | null | undefined): void;
  json(data: unknown): void;
  requestRetryOption(option: RequestRetryOption): void;
  xml<T>(
    argName: string,
    data: T,
    rootName: string,
    schema: Schema<T, any>
  ): void;
  stream(file?: FileWrapper): void;
  toRequest(): HttpRequest;
  intercept(
    interceptor: HttpInterceptorInterface<RequestOptions | undefined>
  ): void;
  interceptRequest(interceptor: (request: HttpRequest) => HttpRequest): void;
  interceptResponse(interceptor: (response: HttpContext) => HttpContext): void;
  defaultToError(apiErrorCtor: ApiErrorConstructor, message?: string): void;
  validateResponse(validate: boolean): void;
  throwOn<ErrorCtorArgs extends any[]>(
    statusCode: number | [number, number],
    errorConstructor: new (
      response: HttpContext,
      ...args: ErrorCtorArgs
    ) => any,
    ...args: ErrorCtorArgs
  ): void;
  throwOn<ErrorCtorArgs extends any[]>(
    statusCode: number | [number, number],
    errorConstructor: new (
      response: HttpContext,
      ...args: ErrorCtorArgs
    ) => any,
    isTemplate: boolean,
    ...args: ErrorCtorArgs
  ): void;
  call(requestOptions?: RequestOptions): Promise<ApiResponse<void>>;
  callAsJson<T>(
    schema: Schema<T, any>,
    requestOptions?: RequestOptions
  ): Promise<ApiResponse<T>>;
  callAsStream(
    requestOptions?: RequestOptions
  ): Promise<ApiResponse<NodeJS.ReadableStream | Blob>>;
  callAsText(requestOptions?: RequestOptions): Promise<ApiResponse<string>>;
  callAsOptionalText(
    requestOptions?: RequestOptions
  ): Promise<ApiResponse<string | undefined>>;
  callAsXml<T>(
    rootName: string,
    schema: Schema<T, any>,
    requestOptions?: RequestOptions
  ): Promise<ApiResponse<T>>;
  callAsXml<T>(
    rootName: string,
    schema: Schema<T, any>,
    requestOptions?: RequestOptions
  ): Promise<ApiResponse<T>>;
  clone(): RequestBuilder<BaseUrlParamType, AuthParams>;
}

export class DefaultRequestBuilder<BaseUrlParamType, AuthParams>
  implements RequestBuilder<BaseUrlParamType, AuthParams> {
  protected _accept?: string;
  protected _contentType?: string;
  protected _headers: Record<string, string>;
  protected _body?: string;
  protected _stream?: FileWrapper;
  protected _queryParams: Record<string, unknown>;
  protected _queryParamsPrefixFormat: Record<string, ArrayPrefixFunction>;
  protected _templateParams: Record<string, PathTemplateTypes>;
  protected _form?: Record<string, PathTemplateTypes>;
  protected _formPrefixFormat: ArrayPrefixFunction | undefined;
  protected _formData?: Record<string, PathTemplateTypes>;
  protected _formDataPrefixFormat: ArrayPrefixFunction | undefined;
  protected _baseUrlArg: BaseUrlParamType | undefined;
  protected _validateResponse: boolean;
  protected _interceptors: Array<
    HttpInterceptorInterface<RequestOptions | undefined>
  >;
  protected _authParams?: AuthParams;
  protected _retryOption: RequestRetryOption;
  protected _apiErrorFactory: ApiErrorFactory;
  protected _errorTypes: Array<ErrorType<any>>;
  public prepareArgs: typeof prepareArgs;

  constructor(
    protected _httpClient: HttpClientInterface,
    protected _baseUrlProvider: (arg?: BaseUrlParamType) => string,
    protected _apiErrorCtr: ApiErrorConstructor,
    protected _authenticationProvider: AuthenticatorInterface<AuthParams>,
    protected _httpMethod: HttpMethod,
    protected _xmlSerializer: XmlSerializerInterface,
    protected _retryConfig: RetryConfiguration,
    protected _path?: string,
    protected _apiLogger?: ApiLoggerInterface
  ) {
    this._headers = {};
    this._queryParams = {};
    this._queryParamsPrefixFormat = {};
    this._templateParams = {};
    this._interceptors = [];
    this._errorTypes = [];
    this._validateResponse = true;
    this._apiErrorFactory = { apiErrorCtor: _apiErrorCtr };
    this._addResponseValidator();
    this._addAuthentication();
    this._addRetryInterceptor();
    this._addErrorHandlingInterceptor();
    this._addApiLoggerInterceptors();

    this._retryOption = RequestRetryOption.Default;
    this.prepareArgs = prepareArgs.bind(this);
  }
  public authenticate(params: AuthParams): void {
    this._authParams = params;
  }
  public requestRetryOption(option: RequestRetryOption): void {
    this._retryOption = option;
  }
  public deprecated(methodName: string, message?: string): void {
    deprecated(methodName, message);
  }
  public appendTemplatePath(
    strings: TemplateStringsArray,
    ...args: PathTemplateTypes[]
  ): void {
    const pathSegment = pathTemplate(strings, ...args);
    this.appendPath(pathSegment);
  }
  public method(httpMethodName: HttpMethod): void {
    this._httpMethod = httpMethodName;
  }
  public baseUrl(arg: BaseUrlParamType): void {
    this._baseUrlArg = arg;
  }
  public appendPath(path: string): void {
    this._path = this._path ? mergePath(this._path, path) : path;
  }
  public acceptJson(): void {
    this._accept = JSON_CONTENT_TYPE;
  }
  public accept(acceptHeaderValue: string): void {
    this._accept = acceptHeaderValue;
  }
  public contentType(contentTypeHeaderValue: string): void {
    this._contentType = contentTypeHeaderValue;
  }
  public header(name: string, value?: unknown): void {
    if (value === null || typeof value === 'undefined') {
      return;
    }
    if (typeof value === 'object') {
      setHeader(this._headers, name, JSON.stringify(value));
      return;
    }
    // String() is used to convert boolean, number, bigint, or unknown types
    setHeader(this._headers, name, String(value));
  }
  public headers(headersToMerge: Record<string, string>): void {
    mergeHeaders(this._headers, headersToMerge);
  }
  public query(
    name: string,
    value: unknown | Record<string, unknown>,
    prefixFormat?: ArrayPrefixFunction
  ): void;
  public query(
    parameters?: Record<string, unknown> | null,
    prefixFormat?: ArrayPrefixFunction
  ): void;
  public query(
    nameOrParameters: string | Record<string, unknown> | null | undefined,
    value?: unknown,
    prefixFormat?: ArrayPrefixFunction
  ): void {
    if (nameOrParameters === null || nameOrParameters === undefined) {
      return;
    }

    if (typeof nameOrParameters === 'string') {
      this._queryParams[nameOrParameters] = value;
      if (prefixFormat) {
        this._queryParamsPrefixFormat[nameOrParameters] = prefixFormat;
      }
      return;
    }
    this.setPrefixFormats(nameOrParameters, prefixFormat);
    this.setQueryParams(nameOrParameters);
  }

  private setPrefixFormats(
    parameters: Record<string, unknown>,
    prefixFormat?: ArrayPrefixFunction
  ): void {
    if (!prefixFormat) {
      return;
    }
    for (const key of Object.keys(parameters)) {
      this._queryParamsPrefixFormat[key] = prefixFormat;
    }
  }

  private setQueryParams(parameters: Record<string, unknown>): void {
    for (const [key, val] of Object.entries(parameters)) {
      if (val !== undefined && val !== null) {
        this._queryParams[key] = val;
      }
    }
  }
  public template(name: string, value: PathTemplateTypes): void {
    this._templateParams[name] = value;
  }
  public text(
    body: string | number | bigint | boolean | null | undefined
  ): void {
    this._body = body?.toString() ?? undefined;
    this._setContentTypeIfNotSet(TEXT_CONTENT_TYPE);
  }
  public json(data: unknown): void {
    this._body = JSON.stringify(data);
    this._setContentTypeIfNotSet(JSON_CONTENT_TYPE);
  }
  public xml<T>(
    argName: string,
    data: T,
    rootName: string,
    schema: Schema<T, any>
  ): void {
    const mappingResult = validateAndUnmapXml(data, schema);
    if (mappingResult.errors) {
      throw new ArgumentsValidationError({ [argName]: mappingResult.errors });
    }
    this._body = this._xmlSerializer.xmlSerialize(
      rootName,
      mappingResult.result
    );
    this._setContentTypeIfNotSet(XML_CONTENT_TYPE);
  }
  public stream(file?: FileWrapper): void {
    this._stream = file;
  }
  public form(
    parameters: Record<string, unknown>,
    prefixFormat?: ArrayPrefixFunction
  ): void {
    this._form = parameters;
    this._formPrefixFormat = prefixFormat;
  }
  public formData(
    parameters: Record<string, unknown>,
    prefixFormat?: ArrayPrefixFunction
  ): void {
    this._formData = parameters;
    this._formDataPrefixFormat = prefixFormat;
  }
  public updateParameterByJsonPointer(
    pointer: string | null,
    setter: (value: any) => any
  ): this {
    if (!pointer) {
      return this;
    }

    const [prefix, point = ''] = pointer.split('#');

    if (prefix === '$request.body') {
      this.updateBody(point, setter);
    } else if (prefix === '$request.path') {
      updateValueByJsonPointer(this._templateParams, point, setter);
    } else if (prefix === '$request.query') {
      updateValueByJsonPointer(this._queryParams, point, setter);
    } else if (prefix === '$request.headers') {
      updateValueByJsonPointer(this._headers, point, setter);
    }

    return this;
  }
  public toRequest(): HttpRequest {
    const request: HttpRequest = {
      method: this._httpMethod,
      url: mergePath(this._baseUrlProvider(this._baseUrlArg), this.buildPath()),
    };

    const queryString = this._convertQueryParamsToString();
    if (queryString.length > 0) {
      request.url +=
        (request.url.indexOf('?') === -1 ? '?' : '&') + queryString;
    }

    request.url = sanitizeUrl(request.url);

    // defensively copy headers
    const headers = { ...this._headers };

    if (this._accept) {
      setHeader(headers, ACCEPT_HEADER, this._accept);
    }

    if (this._contentType) {
      setHeader(headers, CONTENT_TYPE_HEADER, this._contentType);
    }

    setHeader(headers, CONTENT_LENGTH_HEADER);

    request.headers = headers;

    if (this._body !== undefined) {
      request.body = { type: 'text', content: this._body };
    } else if (this._form !== undefined) {
      request.body = {
        type: 'form',
        content: filterFileWrapperFromKeyValuePairs(
          formDataEncodeObject(this._form, this._formPrefixFormat)
        ),
      };
    } else if (this._formData !== undefined) {
      request.body = {
        type: 'form-data',
        content: formDataEncodeObject(
          this._formData,
          this._formDataPrefixFormat
        ),
      };
    } else if (this._stream !== undefined) {
      request.body = { type: 'stream', content: this._stream };
    }

    return request;
  }
  public intercept(
    interceptor: HttpInterceptorInterface<RequestOptions | undefined>
  ): void {
    this._interceptors.push(interceptor);
  }
  public interceptRequest(
    interceptor: (httpRequest: HttpRequest) => HttpRequest
  ): void {
    this.intercept((req, opt, next) => next(interceptor(req), opt));
  }
  public interceptResponse(
    interceptor: (response: HttpContext) => HttpContext
  ): void {
    this.intercept(async (req, opt, next) => interceptor(await next(req, opt)));
  }
  public defaultToError(
    apiErrorCtor: ApiErrorConstructor,
    message?: string
  ): void {
    this._apiErrorFactory = { apiErrorCtor, message };
  }
  public validateResponse(validate: boolean): void {
    this._validateResponse = validate;
  }
  public throwOn<ErrorCtorArgs extends any[]>(
    statusCode: number | [number, number],
    errorConstructor: new (
      response: HttpContext,
      ...args: ErrorCtorArgs
    ) => any,
    ...args: ErrorCtorArgs
  ): void;
  public throwOn<ErrorCtorArgs extends any[]>(
    statusCode: number | [number, number],
    errorConstructor: new (
      response: HttpContext,
      ...args: ErrorCtorArgs
    ) => any,
    isTemplate?: boolean,
    ...args: ErrorCtorArgs
  ): void {
    this._errorTypes.push({ statusCode, errorConstructor, isTemplate, args });
  }
  public async call(
    requestOptions?: RequestOptions
  ): Promise<ApiResponse<void>> {
    // Prepare the HTTP pipeline
    const pipeline = callHttpInterceptors(
      this._interceptors,
      // tslint:disable-next-line:no-shadowed-variable
      async (request, opt) => {
        // tslint:disable-next-line:no-shadowed-variable
        const response = await this._httpClient(request, opt);
        return { request, response };
      }
    );

    // Execute HTTP pipeline
    const { request, response } = await pipeline(
      this.toRequest(),
      requestOptions
    );

    return { ...response, request, result: undefined };
  }
  public async callAsText(
    requestOptions?: RequestOptions
  ): Promise<ApiResponse<string>> {
    const result = await this.call(requestOptions);
    if (typeof result.body !== 'string') {
      throw new Error('Could not parse body as string.'); // TODO: Replace with SDK error
    }
    return { ...result, result: result.body };
  }
  public async callAsOptionalText(
    requestOptions?: RequestOptions
  ): Promise<ApiResponse<string | undefined>> {
    const result = await this.call(requestOptions);
    if (typeof result.body !== 'string') {
      return { ...result, result: undefined };
    }
    return { ...result, result: result.body };
  }
  public async callAsStream(
    requestOptions?: RequestOptions
  ): Promise<ApiResponse<NodeJS.ReadableStream | Blob>> {
    this.interceptRequest((req) => ({ ...req, responseType: 'stream' }));
    const result = await this.call(requestOptions);
    return { ...result, result: convertToStream(result.body) };
  }
  public async callAsJson<T>(
    schema: Schema<T>,
    requestOptions?: RequestOptions
  ): Promise<ApiResponse<T>> {
    this.interceptRequest((request) => {
      const headers = { ...request.headers };
      setHeaderIfNotSet(headers, ACCEPT_HEADER, JSON_CONTENT_TYPE);
      return { ...request, headers };
    });
    const result = await this.call(requestOptions);

    return { ...result, result: parseJsonResult(schema, result) };
  }
  public async callAsXml<T>(
    rootName: string,
    schema: Schema<T, any>,
    requestOptions?: RequestOptions
  ): Promise<ApiResponse<T>> {
    this.interceptRequest((request) => {
      const headers = { ...request.headers };
      setHeaderIfNotSet(headers, ACCEPT_HEADER, XML_CONTENT_TYPE);
      return { ...request, headers };
    });
    const result = await this.call(requestOptions);
    if (result.body === '') {
      throw new Error(
        'Could not parse body as XML. The response body is empty.'
      );
    }
    if (typeof result.body !== 'string') {
      throw new Error(
        'Could not parse body as XML. The response body is not a string.'
      );
    }
    let xmlObject: unknown;
    try {
      xmlObject = await this._xmlSerializer.xmlDeserialize(
        rootName,
        result.body
      );
    } catch (error) {
      throw new Error(`Could not parse body as XML.\n\n${error.message}`);
    }
    const mappingResult = validateAndMapXml(xmlObject, schema);
    if (mappingResult.errors) {
      throw new ResponseValidationError(result, mappingResult.errors);
    }
    return { ...result, result: mappingResult.result };
  }

  public clone(): DefaultRequestBuilder<BaseUrlParamType, AuthParams> {
    const cloned = new DefaultRequestBuilder(
      this._httpClient,
      this._baseUrlProvider,
      this._apiErrorCtr,
      this._authenticationProvider,
      this._httpMethod,
      this._xmlSerializer,
      this._retryConfig,
      this._path,
      this._apiLogger
    );

    this.cloneParameters(cloned);
    return cloned;
  }
  private cloneParameters(
    cloned: DefaultRequestBuilder<BaseUrlParamType, AuthParams>
  ) {
    cloned._accept = this._accept;
    cloned._contentType = this._contentType;
    cloned._headers = { ...this._headers };
    cloned._body = this._body;
    cloned._stream = this._stream;
    cloned._queryParams = { ...this._queryParams };
    cloned._queryParamsPrefixFormat = { ...this._queryParamsPrefixFormat };
    cloned._templateParams = { ...this._templateParams };
    cloned._form = this._form ? { ...this._form } : undefined;
    cloned._formPrefixFormat = this._formPrefixFormat;
    cloned._formData = this._formData ? { ...this._formData } : undefined;
    cloned._formDataPrefixFormat = this._formDataPrefixFormat;
    cloned._baseUrlArg = this._baseUrlArg;
    cloned._validateResponse = this._validateResponse;
    cloned._interceptors = [...this._interceptors];
    cloned._authParams = this._authParams;
    cloned._retryOption = this._retryOption;
    cloned._apiErrorFactory = { ...this._apiErrorFactory };
    cloned._errorTypes = [...this._errorTypes];
  }
  private updateBody(pointer: string, setter: (value: any) => any) {
    if (this._body) {
      if (pointer === '') {
        this._body = setter(this._body.toString());
        return;
      }
      this._body = JSON.parse(this._body);
      updateValueByJsonPointer(this._body, pointer, setter);
      this._body = JSON.stringify(this._body);
      return;
    }
    if (this._form) {
      updateValueByJsonPointer(this._form, pointer, setter);
      return;
    }
    updateValueByJsonPointer(this._formData, pointer, setter);
  }
  private _setContentTypeIfNotSet(contentType: string) {
    if (!this._contentType) {
      setHeaderIfNotSet(this._headers, CONTENT_TYPE_HEADER, contentType);
    }
  }
  private _addResponseValidator(): void {
    this.interceptResponse((context) => {
      const { response } = context;
      if (
        this._validateResponse &&
        (response.statusCode < 200 || response.statusCode >= 300)
      ) {
        if (typeof this._apiErrorFactory?.message === 'undefined') {
          this._apiErrorFactory.message = `Response status code was not ok: ${response.statusCode}.`;
        }
        throw new this._apiErrorFactory.apiErrorCtor(
          context,
          this._apiErrorFactory.message
        );
      }
      return context;
    });
  }
  private _addApiLoggerInterceptors(): void {
    if (this._apiLogger) {
      const apiLogger = this._apiLogger;

      this.intercept(async (request, options, next) => {
        apiLogger.logRequest(request);
        const context = await next(request, options);
        apiLogger.logResponse(context.response);
        return context;
      });
    }
  }
  private buildPath(): string {
    if (!this._path) {
      return '';
    }

    for (const [key, value] of Object.entries(this._templateParams)) {
      if (value !== undefined && value !== null) {
        this._path = this._path.replace(
          `{${key}}`,
          encodeURIComponent(String(value))
        );
      }
    }
    return this._path;
  }
  private _addAuthentication() {
    this.intercept((...args) => {
      const handler = this._authenticationProvider(this._authParams);
      return handler(...args);
    });
  }
  private _addRetryInterceptor() {
    this.intercept(async (request, options, next) => {
      let context: HttpContext | undefined;
      let allowedWaitTime = this._retryConfig.maximumRetryWaitTime;
      let retryCount = 0;
      let waitTime = 0;
      let timeoutError: Error | undefined;
      const shouldRetry = shouldRetryRequest(
        this._retryOption,
        this._retryConfig,
        this._httpMethod
      );
      do {
        timeoutError = undefined;
        if (retryCount > 0) {
          await new Promise((res) => setTimeout(res, waitTime * 1000));
          allowedWaitTime -= waitTime;
        }
        try {
          context = await next(request, options);
        } catch (error) {
          timeoutError = error;
        }
        if (shouldRetry) {
          waitTime = getRetryWaitTime(
            this._retryConfig,
            allowedWaitTime,
            retryCount,
            context?.response?.statusCode,
            context?.response?.headers,
            timeoutError
          );

          retryCount++;
        }
      } while (waitTime > 0);
      if (timeoutError) {
        throw timeoutError;
      }
      if (typeof context?.response === 'undefined') {
        throw new Error('Response is undefined.');
      }
      return { request, response: context.response };
    });
  }
  private _addErrorHandlingInterceptor() {
    this.interceptResponse((context) => {
      const { response } = context;
      for (const { statusCode, errorConstructor, isTemplate, args } of this
        ._errorTypes) {
        if (
          (typeof statusCode === 'number' &&
            response.statusCode === statusCode) ||
          (typeof statusCode !== 'number' &&
            response.statusCode >= statusCode[0] &&
            response.statusCode <= statusCode[1])
        ) {
          if (isTemplate && args.length > 0) {
            args[0] = updateErrorMessage(args[0], response);
          }
          throw new errorConstructor(context, ...args);
        }
      }
      return context;
    });
  }
  private _convertQueryParamsToString(): string {
    const queryParts: string[] = [];

    for (const [key, value] of Object.entries(this._queryParams)) {
      const formatter = this._queryParamsPrefixFormat?.[key];

      const encoded = urlEncodeObject({ [key]: value }, formatter);

      if (encoded) {
        queryParts.push(encoded);
      }
    }

    return queryParts.join('&');
  }
}

export function createRequestBuilderFactory<BaseUrlParamType, AuthParams>(
  httpClient: HttpClientInterface,
  baseUrlProvider: (arg?: BaseUrlParamType) => string,
  apiErrorConstructor: ApiErrorConstructor,
  authenticationProvider: AuthenticatorInterface<AuthParams>,
  retryConfig: RetryConfiguration,
  xmlSerializer: XmlSerializerInterface = new XmlSerialization(),
  apiLogger?: ApiLoggerInterface
): RequestBuilderFactory<BaseUrlParamType, AuthParams> {
  return (httpMethod, path?) => {
    return new DefaultRequestBuilder(
      httpClient,
      baseUrlProvider,
      apiErrorConstructor,
      authenticationProvider,
      httpMethod,
      xmlSerializer,
      retryConfig,
      path,
      apiLogger
    );
  };
}

function mergePath(left: string, right?: string): string {
  if (!right || right === '') {
    return left;
  }
  // remove all occurances of `/` (if any) from the end of left path
  left = left.replace('/', ' ').trimEnd().replace(' ', '/');
  // remove all occurances of `/` (if any) from the start of right sub-path
  right = right.replace('/', ' ').trimStart().replace(' ', '/');

  return `${left}/${right}`;
}

function parseJsonResult<T>(schema: Schema<T, any>, res: ApiResponse<void>): T {
  if (typeof res.body !== 'string') {
    throw new Error(
      'Could not parse body as JSON. The response body is not a string.'
    );
  }
  if (res.body.trim() === '') {
    const resEmptyErr = new Error(
      'Could not parse body as JSON. The response body is empty.'
    );
    return validateJson(schema, null, (_) => resEmptyErr);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(res.body);
  } catch (error) {
    const resUnParseErr = new Error(
      `Could not parse body as JSON.\n\n${error.message}`
    );
    return validateJson(schema, res.body, (_) => resUnParseErr);
  }
  const resInvalidErr = (errors: SchemaValidationError[]) =>
    new ResponseValidationError(res, errors);
  return validateJson(schema, parsed, (errors) => resInvalidErr(errors));
}

function validateJson<T>(
  schema: Schema<T, any>,
  value: any,
  errorCreater: (errors: SchemaValidationError[]) => Error
): T {
  const mappingResult = validateAndMap(value, schema);
  if (mappingResult.errors) {
    throw errorCreater(mappingResult.errors);
  }
  return mappingResult.result;
}
