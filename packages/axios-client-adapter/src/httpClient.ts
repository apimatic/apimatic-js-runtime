import {
  AxiosHeaders,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosResponseHeaders,
  RawAxiosResponseHeaders,
  default as axios,
} from 'axios';
import isNode from 'detect-node';
import FormData from 'form-data';
import {
  CONTENT_TYPE_HEADER,
  FORM_URLENCODED_CONTENT_TYPE,
} from '@apimatic/http-headers';
import {
  HttpRequest,
  HttpResponse,
  RetryConfiguration,
} from '@apimatic/core-interfaces';
import { urlEncodeKeyValuePairs } from '@apimatic/http-query';
import { isFileWrapper } from '@apimatic/file-wrapper';
import { configureProxyAgent, ProxySettings } from '@apimatic/proxy';

export const DEFAULT_AXIOS_CONFIG_OVERRIDES: AxiosRequestConfig = {
  transformResponse: [],
};

export const DEFAULT_TIMEOUT = 30 * 1000;

/**
 * HTTP client implementation.
 *
 * This implementation is a wrapper over the Axios client.
 */
export class HttpClient {
  private _axiosInstance: AxiosInstance;
  private _timeout: number;
  private _abortErrorFactory: AbortErrorConstructor;
  private readonly _proxySettings?: ProxySettings;

  constructor(
    abortErrorFactory: AbortErrorConstructor,
    {
      clientConfigOverrides,
      timeout = DEFAULT_TIMEOUT,
      httpAgent,
      httpsAgent,
      proxySettings,
    }: {
      clientConfigOverrides?: AxiosRequestConfig;
      timeout?: number;
      httpAgent?: any;
      httpsAgent?: any;
      proxySettings?: ProxySettings;
    } = {}
  ) {
    this._proxySettings = proxySettings;
    this._timeout = timeout;
    this._axiosInstance = axios.create({
      ...DEFAULT_AXIOS_CONFIG_OVERRIDES,
      ...clientConfigOverrides,
      ...{ httpAgent, httpsAgent },
      proxy: false,
    });
    this._abortErrorFactory = abortErrorFactory;
  }

  /** Converts an HttpRequest object to an Axios request. */
  public convertHttpRequest(req: HttpRequest): AxiosRequestConfig {
    const newRequest: AxiosRequestConfig = {
      method: req.method,
      url: req.url,
      responseType: 'text',
      headers: { ...req.headers },
    };

    let headers = new AxiosHeaders({
      ...req.headers,
    });

    if (req.auth) {
      newRequest.auth = {
        username: req.auth.username,
        password: req.auth.password || '',
      };
    }

    const requestBody = req.body;
    if (requestBody?.type === 'text') {
      newRequest.data = requestBody.content;
    } else if (
      requestBody?.type === 'form-data' &&
      requestBody.content.some((item) => isFileWrapper(item.value))
    ) {
      const form = new FormData();
      for (const iter of requestBody.content) {
        if (isFileWrapper(iter.value)) {
          let fileData = iter.value.file;

          if (isBlob(fileData) && iter.value.options?.contentType) {
            fileData = new Blob([fileData], {
              type: iter.value.options.contentType,
            });
          }

          form.append(iter.key, fileData, iter.value.options);
        } else {
          form.append(iter.key, iter.value);
        }
      }

      newRequest.data = form;
      headers = headers.concat(form.getHeaders());
    } else if (
      requestBody?.type === 'form-data' ||
      requestBody?.type === 'form'
    ) {
      headers = headers.set(CONTENT_TYPE_HEADER, FORM_URLENCODED_CONTENT_TYPE);
      newRequest.data = urlEncodeKeyValuePairs(requestBody.content);
    } else if (requestBody?.type === 'stream') {
      let contentType = 'application/octet-stream';
      if (isBlob(requestBody.content.file) && requestBody.content.file.type) {
        contentType = requestBody.content.file.type;
      } else if (requestBody.content.options?.contentType) {
        contentType = requestBody.content.options.contentType;
      }
      headers = headers.set(CONTENT_TYPE_HEADER, contentType, false);
      newRequest.data = requestBody.content.file;
    }

    if (req.responseType === 'stream') {
      newRequest.responseType = isNode ? 'stream' : 'blob';
    }

    newRequest.validateStatus = () => true;
    newRequest.timeout = this._timeout;
    newRequest.headers = headers;

    return newRequest;
  }

  /** Converts an Axios response to an HttpResponse object. */
  public convertHttpResponse(resp: AxiosResponse): HttpResponse {
    return {
      body: resp.data,
      headers: this.convertAxiosResponseHeadersToHttpResponseHeaders(
        resp.headers
      ),
      statusCode: resp.status,
    };
  }

  public convertAxiosResponseHeadersToHttpResponseHeaders(
    axiosHeaders: RawAxiosResponseHeaders | AxiosResponseHeaders
  ): Record<string, string> {
    const httpResponseHeaders: Record<string, string> = {};

    for (const key in axiosHeaders) {
      if (typeof axiosHeaders[key] !== 'function') {
        const lowercaseKey = key.toLowerCase();
        httpResponseHeaders[lowercaseKey] = String(axiosHeaders[key]);
      }
    }

    return httpResponseHeaders;
  }

  /**
   * Executes the HttpRequest with the given options and returns the HttpResponse
   * or throws an error.
   */
  public async executeRequest(
    request: HttpRequest,
    requestOptions?: { abortSignal?: AbortSignal }
  ): Promise<HttpResponse> {
    const axiosRequest = this.convertHttpRequest(request);

    this.setProxyAgent(axiosRequest);

    if (requestOptions?.abortSignal) {
      if (requestOptions.abortSignal.aborted) {
        throw this.abortError();
      }

      const cancelToken = axios.CancelToken.source();
      axiosRequest.cancelToken = cancelToken.token;

      requestOptions.abortSignal.addEventListener('abort', () => {
        cancelToken.cancel();
      });
    }

    try {
      return this.convertHttpResponse(await this._axiosInstance(axiosRequest));
    } catch (error) {
      if (axios.isCancel(error)) {
        throw this.abortError();
      }

      throw error;
    }
  }

  public setProxyAgent(axiosRequest: AxiosRequestConfig): void {
    if (!this._proxySettings || !axiosRequest.url) {
      return;
    }
    const proxyAgents = configureProxyAgent(this._proxySettings);

    const protocol = new URL(axiosRequest.url).protocol;

    if (protocol === 'https:') {
      axiosRequest.httpsAgent = proxyAgents?.httpsAgent;
    } else if (protocol === 'http:') {
      axiosRequest.httpAgent = proxyAgents?.httpAgent;
    }
  }

  private abortError() {
    return new this._abortErrorFactory('The HTTP call was aborted.');
  }
}

/** Stable configurable http client options. */
export interface HttpClientOptions {
  /** Timeout in milliseconds. */
  timeout: number;
  /** Custom http agent to be used when performing http requests. */
  httpAgent?: any;
  /** Custom https agent to be used when performing https requests. */
  httpsAgent?: any;
  proxySettings: ProxySettings;
  /** Configurations to retry requests */
  retryConfig: Partial<RetryConfiguration>;
}

export type AbortErrorConstructor = new (message?: string) => any;

/**
 * Check whether value is an instance of Blob
 */
export function isBlob(value: unknown): value is Blob {
  if (typeof Blob === 'undefined') {
    return false;
  }

  return (
    value instanceof Blob ||
    Object.prototype.toString.call(value) === '[object Blob]'
  );
}
