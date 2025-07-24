import { DEFAULT_TIMEOUT, HttpClient, isBlob } from '../src/httpClient';
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
import FormData from 'form-data';
import fs from 'fs';
import { AbortError } from './abortError';

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
