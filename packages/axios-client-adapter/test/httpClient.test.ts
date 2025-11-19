import {
  DEFAULT_TIMEOUT,
  HttpClient,
  isBlob,
  createFormDataOptions,
} from '../src/httpClient';
import {
  AxiosHeaders,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import {
  HttpRequest,
  HttpRequestMultipartFormBody,
  HttpRequestStreamBody,
  HttpRequestTextBody,
  HttpRequestUrlEncodedFormBody,
  HttpResponse,
} from '@apimatic/core-interfaces';
import { FileWrapper } from '@apimatic/file-wrapper';
import { createFormData } from '@apimatic/core-interfaces';
import FormData from 'form-data';
import fs from 'fs';

/**
 * Thrown when the API call is aborted by the caller.
 *
 * Note that when an AbortError is thrown, it is not a guarantee that the API call
 * did not go through.
 */
class AbortError extends Error {
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

describe('HTTP Client', () => {
  it('converts request with http text body and http get method', () => {
    const httpClient = new HttpClient(AbortError);
    const textBody: HttpRequestTextBody = {
      content: 'testBody',
      type: 'text',
    };

    const request: HttpRequest = {
      method: 'GET',
      url: 'http://apimatic.hopto.org:3000/test/requestBuilder',
      headers: { 'test-header': 'test-value' },
      body: textBody,
      responseType: 'text',
      auth: { username: 'test-username', password: 'test-password' },
    };

    const expectedAxiosRequestConfig: AxiosRequestConfig = {
      url: 'http://apimatic.hopto.org:3000/test/requestBuilder',
      method: 'GET',
      headers: { 'test-header': 'test-value' },
      data: 'testBody',
      timeout: DEFAULT_TIMEOUT,
      responseType: 'text',
    };
    const axiosRequestConfig = httpClient.convertHttpRequest(request);
    expect(axiosRequestConfig).toMatchObject(expectedAxiosRequestConfig);
  });

  it('converts request with http form body and http get method', async () => {
    const httpClient = new HttpClient(AbortError);
    const formBody: HttpRequestUrlEncodedFormBody = {
      type: 'form',
      content: [
        { key: 'param1', value: 'value1' },
        { key: 'param2', value: 'value2' },
      ],
    };

    const request: HttpRequest = {
      method: 'GET',
      url: 'http://apimatic.hopto.org:3000/test/requestBuilder',
      headers: { 'test-header': 'test-value' },
      body: formBody,
      responseType: 'text',
      auth: { username: 'test-username', password: 'test-password' },
    };
    const expectedAxiosRequestConfig: AxiosRequestConfig = {
      url: 'http://apimatic.hopto.org:3000/test/requestBuilder',
      method: 'GET',
      headers: {
        'test-header': 'test-value',
        'content-type': 'application/x-www-form-urlencoded',
      },
      data: 'param1=value1&param2=value2',
      timeout: DEFAULT_TIMEOUT,
      responseType: 'text',
      auth: { username: 'test-username', password: 'test-password' },
    };

    const axiosRequestConfig = httpClient.convertHttpRequest(request);
    expect(axiosRequestConfig).toMatchObject(expectedAxiosRequestConfig);
  });

  it('converts request with http form-data(file-stream) body and http get method', async () => {
    const httpClient = new HttpClient(AbortError);
    const fileWrapper = new FileWrapper(
      fs.createReadStream('test/dummy_file.txt'),
      {
        contentType: 'application/x-www-form-urlencoded',
        filename: 'dummy_file',
        headers: { 'test-header': 'test-value' },
      }
    );
    const formDataBody: HttpRequestMultipartFormBody = {
      type: 'form-data',
      content: [
        { key: 'param1', value: 'value1' },
        { key: 'param2', value: fileWrapper },
      ],
    };

    const request: HttpRequest = {
      method: 'GET',
      url: 'http://apimatic.hopto.org:3000/test/requestBuilder',
      headers: { 'test-header': 'test-value' },
      body: formDataBody,
      responseType: 'text',
      auth: { username: 'test-username', password: 'test-password' },
    };

    const axiosRequestConfig = httpClient.convertHttpRequest(request);
    expect(axiosRequestConfig).toMatchObject({
      url: 'http://apimatic.hopto.org:3000/test/requestBuilder',
      method: 'GET',
      headers: {
        'test-header': 'test-value',
        'content-type': new RegExp(
          '^multipart/form-data; boundary=--------------------------'
        ),
      },
      timeout: DEFAULT_TIMEOUT,
      responseType: 'text',
      data: expect.any(FormData),
      auth: { username: 'test-username', password: 'test-password' },
    });
  });

  it('converts request with http form-data containing FormDataWrapper and FileWrapper', async () => {
    const httpClient = new HttpClient(AbortError);
    // Need FileWrapper to trigger multipart mode
    const fileWrapper = new FileWrapper(
      fs.createReadStream('test/dummy_file.txt'),
      {
        filename: 'document.txt',
        headers: { 'content-type': 'text/plain' },
      }
    );
    const formDataWrapper = createFormData(
      { userId: 123, name: 'Test User' },
      { 'content-type': 'application/json' }
    );
    const formDataBody: HttpRequestMultipartFormBody = {
      type: 'form-data',
      content: [
        { key: 'file', value: fileWrapper },
        { key: 'metadata', value: formDataWrapper! },
        { key: 'param1', value: 'value1' },
      ],
    };

    const request: HttpRequest = {
      method: 'POST',
      url: 'http://apimatic.hopto.org:3000/test/requestBuilder',
      headers: { 'test-header': 'test-value' },
      body: formDataBody,
      responseType: 'text',
    };

    const axiosRequestConfig = httpClient.convertHttpRequest(request);
    expect(axiosRequestConfig).toMatchObject({
      url: 'http://apimatic.hopto.org:3000/test/requestBuilder',
      method: 'POST',
      headers: {
        'test-header': 'test-value',
        'content-type': new RegExp(
          '^multipart/form-data; boundary=--------------------------'
        ),
      },
      timeout: DEFAULT_TIMEOUT,
      responseType: 'text',
      data: expect.any(FormData),
    });
  });

  it('converts request with mixed form-data containing multiple FormDataWrappers', async () => {
    const httpClient = new HttpClient(AbortError);
    // Need FileWrapper to trigger multipart mode
    const fileWrapper = new FileWrapper(
      fs.createReadStream('test/dummy_file.txt')
    );
    const formDataWrapper1 = createFormData(
      { type: 'document', status: 'active' },
      { 'content-type': 'application/json' }
    );
    const formDataWrapper2 = createFormData({
      version: 1,
      lastModified: '2025-10-31',
    });

    const formDataBody: HttpRequestMultipartFormBody = {
      type: 'form-data',
      content: [
        { key: 'file', value: fileWrapper },
        { key: 'metadata', value: formDataWrapper1! },
        { key: 'version_info', value: formDataWrapper2! },
        { key: 'description', value: 'Test upload' },
      ],
    };

    const request: HttpRequest = {
      method: 'POST',
      url: 'http://apimatic.hopto.org:3000/test/upload',
      headers: { authorization: 'Bearer token123' },
      body: formDataBody,
      responseType: 'text',
    };

    const axiosRequestConfig = httpClient.convertHttpRequest(request);
    expect(axiosRequestConfig).toMatchObject({
      url: 'http://apimatic.hopto.org:3000/test/upload',
      method: 'POST',
      headers: {
        authorization: 'Bearer token123',
        'content-type': new RegExp(
          '^multipart/form-data; boundary=--------------------------'
        ),
      },
      timeout: DEFAULT_TIMEOUT,
      responseType: 'text',
      data: expect.any(FormData),
    });
  });

  it('converts request with http stream body(file stream) and http get method', async () => {
    const httpClient = new HttpClient(AbortError);
    const streamBody: HttpRequestStreamBody = {
      type: 'stream',
      content: new FileWrapper(fs.createReadStream('test/dummy_file.txt'), {
        contentType: 'application/x-www-form-urlencoded',
        filename: 'dummy_file',
        headers: { 'test-header': 'test-value' },
      }),
    };

    const request: HttpRequest = {
      method: 'GET',
      url: 'http://apimatic.hopto.org:3000/test/requestBuilder',
      headers: { 'test-header': 'test-value' },
      body: streamBody,
      responseType: 'stream',
      auth: { username: 'test-username', password: 'test-password' },
    };

    const axiosRequestConfig = httpClient.convertHttpRequest(request);
    expect(axiosRequestConfig).toMatchObject({
      url: 'http://apimatic.hopto.org:3000/test/requestBuilder',
      method: 'GET',
      headers: {
        'test-header': 'test-value',
        'content-type': 'application/x-www-form-urlencoded',
      },
      timeout: DEFAULT_TIMEOUT,
      responseType: 'stream',
      data: streamBody.content.file,
      auth: { username: 'test-username', password: 'test-password' },
    });
  });

  it('converts request with http stream body(blob) and http get method', async () => {
    const httpClient = new HttpClient(AbortError);
    const blob = new Blob(['I have dummy data'], {
      type: 'text/plain;charset=utf-8',
    });

    const fileWrapper = new FileWrapper(blob, {
      contentType: 'text/plain;charset=utf-8',
      filename: 'dummy_file',
      headers: { 'test-header': 'test-value' },
    });

    const streamBody: HttpRequestStreamBody = {
      type: 'stream',
      content: fileWrapper,
    };

    const request: HttpRequest = {
      method: 'GET',
      url: 'http://apimatic.hopto.org:3000/test/requestBuilder',
      headers: { 'test-header': 'test-value' },
      body: streamBody,
      responseType: 'stream',
      auth: { username: 'test-username', password: 'test-password' },
    };

    const axiosRequestConfig = httpClient.convertHttpRequest(request);
    expect(axiosRequestConfig).toMatchObject({
      url: 'http://apimatic.hopto.org:3000/test/requestBuilder',
      method: 'GET',
      headers: {
        'test-header': 'test-value',
        'content-type': 'text/plain;charset=utf-8',
      },
      timeout: DEFAULT_TIMEOUT,
      responseType: 'stream',
      data: streamBody.content.file,
      auth: { username: 'test-username', password: 'test-password' },
    });
  });

  it('converts response to HTTPResponse', async () => {
    const httpClient = new HttpClient(AbortError);
    const config: AxiosRequestConfig = {
      url: 'url',
      method: 'GET',
      headers: { 'test-header': 'test-value' },
      data: 'testBody',
      timeout: DEFAULT_TIMEOUT,
      responseType: 'text',
    };

    const headers = new AxiosHeaders({
      'test-header': 'test-value',
    });

    const internalConfig: InternalAxiosRequestConfig = {
      ...config,
      headers,
    };

    const response: AxiosResponse = {
      data: 'testBody result',
      status: 200,
      statusText: 'OK',
      headers: { 'test-header': 'test-value' },
      config: internalConfig,
    };

    const expectedHttpResponse: HttpResponse = {
      statusCode: 200,
      body: 'testBody result',
      headers: { 'test-header': 'test-value' },
    };

    const httpResponse = httpClient.convertHttpResponse(response);
    expect(httpResponse).toMatchObject(expectedHttpResponse);
  });

  const proxySettings = {
    address: 'http://proxy.example.com',
    port: 8080,
    auth: {
      username: 'user',
      password: 'pass',
    },
  };
  const httpRequest: HttpRequest = {
    method: 'GET',
    headers: { 'test-header': 'test-value' },
    body: {
      content: 'testBody',
      type: 'text',
    },
    url: '',
    responseType: 'text',
    auth: { username: 'test-username', password: 'test-password' },
  };
  const expectedProxyConfig = {
    protocol: 'http:',
    username: 'user',
    password: 'pass',
    host: 'proxy.example.com:8080',
    port: '8080',
  };

  it('adds httpAgent to axios request config for http URLs when proxySettings are provided', () => {
    const httpClient = new HttpClient(AbortError, { proxySettings });
    httpRequest.url = 'http://apimatic.hopto.org:3000/test/requestBuilder';
    const axiosRequestConfig = httpClient.convertHttpRequest(httpRequest);
    expect(axiosRequestConfig.httpAgent.proxy).toMatchObject(
      expectedProxyConfig
    );
  });

  it('adds httpsAgent to axios request config for https URLs when proxySettings are provided', () => {
    const httpClient = new HttpClient(AbortError, { proxySettings });
    httpRequest.url = 'https://apimatic.hopto.org:3000/test/requestBuilder';
    const axiosRequestConfig = httpClient.convertHttpRequest(httpRequest);
    expect(axiosRequestConfig.httpsAgent.proxy).toMatchObject(
      expectedProxyConfig
    );
  });

  it('httpsAgent should be undefined when proxySettings are not provided', () => {
    const httpClient = new HttpClient(AbortError);
    httpRequest.url = 'https://apimatic.hopto.org:3000/test/requestBuilder';
    const axiosRequestConfig = httpClient.convertHttpRequest(httpRequest);
    expect(axiosRequestConfig.httpsAgent).toBeUndefined();
  });

  it('httpsAgent and httpAgent should be undefined when requestUrl is not set', () => {
    const httpClient = new HttpClient(AbortError);
    const axiosRequestConfig = httpClient.convertHttpRequest(httpRequest);
    expect(axiosRequestConfig.httpsAgent).toBeUndefined();
    expect(axiosRequestConfig.httpAgent).toBeUndefined();
  });
});

describe('createFormDataOptions', () => {
  it('should return headers with content type from formDataWrapper headers', () => {
    const formDataWrapper = createFormData(
      { key: 'value' },
      { 'content-type': 'application/json' }
    );

    const result = createFormDataOptions(formDataWrapper?.headers || {});

    expect(result).toEqual({
      contentType: 'application/json',
      header: {},
    });
  });

  it('should return undefined content type when not provided in headers', () => {
    const formDataWrapper = createFormData({ key: 'value' }, {});

    const result = createFormDataOptions(formDataWrapper?.headers || {});

    expect(result).toEqual({
      contentType: undefined,
      header: {},
    });
  });

  it('should handle formDataWrapper with no headers', () => {
    const formDataWrapper = createFormData({ key: 'value' });

    const result = createFormDataOptions(formDataWrapper?.headers || {});

    expect(result).toEqual({
      header: {},
    });
  });

  it('should handle case-insensitive content-type header lookup', () => {
    const formDataWrapper = createFormData(
      { test: 'data' },
      { 'Content-Type': 'application/json; charset=utf-8' }
    );

    const result = createFormDataOptions(formDataWrapper?.headers || {});

    expect(result).toEqual({
      contentType: 'application/json; charset=utf-8',
      header: {},
    });
  });
});

describe('test blob type', () => {
  test.each([
    [
      'test blob type',
      new Blob([JSON.stringify({ isBlob: true })], {
        type: 'application/json',
      }),
      true,
    ],
    ['test undefined type', undefined, false],
  ])('%s', (_: string, value: unknown, expectedResult: boolean) => {
    expect(isBlob(value)).toStrictEqual(expectedResult);
  });
});
