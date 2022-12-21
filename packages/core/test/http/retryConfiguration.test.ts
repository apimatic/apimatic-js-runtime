import {
  getRetryWaitTime,
  RequestRetryOption,
  shouldRetryRequest,
} from '../../src/http/retryConfiguration';
import { HttpMethod, RetryConfiguration } from '../../src/coreInterfaces';

describe('Retry Configuration', () => {
  it('should retry request with default retry option and GET(allowed http method to retry)', () => {
    const retryConfig = {
      maxNumberOfRetries: 3,
      retryOnTimeout: false,
      retryInterval: 1,
      maximumRetryWaitTime: 3,
      backoffFactor: 2,
      httpStatusCodesToRetry: [
        408,
        413,
        429,
        500,
        502,
        503,
        504,
        521,
        522,
        524,
      ],
      httpMethodsToRetry: ['GET', 'PUT'] as HttpMethod[],
    };
    expect(
      shouldRetryRequest(RequestRetryOption.Default, retryConfig, 'GET')
    ).toBeTruthy();
  });

  it('should retry request with enable retry option', () => {
    expect(shouldRetryRequest(RequestRetryOption.Enable)).toBeTruthy();
  });

  it('should not retry request with default retry option and undefined retry config', () => {
    expect(shouldRetryRequest(RequestRetryOption.Default)).toBeFalsy();
  });
  it('should not retry request with not default retry option and POST (not allowed http method to retry)', () => {
    const retryConfig = {
      maxNumberOfRetries: 3,
      retryOnTimeout: false,
      retryInterval: 1,
      maximumRetryWaitTime: 3,
      backoffFactor: 2,
      httpStatusCodesToRetry: [
        408,
        413,
        429,
        500,
        502,
        503,
        504,
        521,
        522,
        524,
      ],
      httpMethodsToRetry: ['GET', 'PUT'] as HttpMethod[],
    };
    expect(
      shouldRetryRequest(RequestRetryOption.Default, retryConfig, 'POST')
    ).toBeFalsy();
  });
  it('should not retry request', () => {
    expect(shouldRetryRequest(RequestRetryOption.Disable)).toBeFalsy();
  });
  describe('get retry wait time', () => {
    test.each([
      [
        'calculate retry wait time by setting allowedRetryWaitTime equal to 3',
        1,
        {
          maxNumberOfRetries: 3,
          retryOnTimeout: false,
          retryInterval: 1,
          maximumRetryWaitTime: 3,
          backoffFactor: 2,
          httpStatusCodesToRetry: [
            408,
            413,
            429,
            500,
            502,
            503,
            504,
            521,
            522,
            524,
          ],
          httpMethodsToRetry: ['GET', 'PUT'] as HttpMethod[],
        },
        3,
        0,
        500,
        { 'test-header': 'test-value' },
        undefined,
      ],
      [
        'calculate retry wait time by setting allowedRetryWaitTime equal to 0',
        0,
        {
          maxNumberOfRetries: 3,
          retryOnTimeout: false,
          retryInterval: 1,
          maximumRetryWaitTime: 0,
          backoffFactor: 2,
          httpStatusCodesToRetry: [
            408,
            413,
            429,
            500,
            502,
            503,
            504,
            521,
            522,
            524,
          ],
          httpMethodsToRetry: ['GET', 'PUT'] as HttpMethod[],
        },
        0,
        0,
        500,
        { 'test-header': 'test-value' },
        undefined,
      ],
      [
        'calculate retry wait time by setting retry-after header in seconds',
        120,
        {
          maxNumberOfRetries: 1,
          retryOnTimeout: false,
          retryInterval: 1,
          maximumRetryWaitTime: 3,
          backoffFactor: 2,
          httpStatusCodesToRetry: [
            408,
            413,
            429,
            500,
            502,
            503,
            504,
            521,
            522,
            524,
          ],
          httpMethodsToRetry: ['GET', 'PUT'] as HttpMethod[],
        },
        120,
        0,
        200,
        { 'retry-after': '120' },
        undefined,
      ],
      [
        'calculate retry wait time by setting retry-after header in dateTime',
        9,
        {
          maxNumberOfRetries: 1,
          retryOnTimeout: false,
          retryInterval: 1,
          maximumRetryWaitTime: 3,
          backoffFactor: 2,
          httpStatusCodesToRetry: [
            408,
            413,
            429,
            500,
            502,
            503,
            504,
            521,
            522,
            524,
          ],
          httpMethodsToRetry: ['GET', 'PUT'] as HttpMethod[],
        },
        10,
        0,
        200,
        { 'retry-after': new Date(Date.now() + 10000).toUTCString() },
        undefined,
      ],
      [
        'calculate retry wait time by setting header and httpCode undefined',
        0,
        {
          maxNumberOfRetries: 1,
          retryOnTimeout: false,
          retryInterval: 1,
          maximumRetryWaitTime: 3,
          backoffFactor: 2,
          httpStatusCodesToRetry: [
            408,
            413,
            429,
            500,
            502,
            503,
            504,
            521,
            522,
            524,
          ],
          httpMethodsToRetry: ['GET', 'PUT'] as HttpMethod[],
        },
        3,
        3,
        undefined,
        { 'test-header': 'test-value' },
        undefined,
      ],
      [
        'calculate retry wait time by setting retryCount < maximumNumberOfRetries',
        0,
        {
          maxNumberOfRetries: 1,
          retryOnTimeout: false,
          retryInterval: 1,
          maximumRetryWaitTime: 3,
          backoffFactor: 2,
          httpStatusCodesToRetry: [
            408,
            413,
            429,
            500,
            502,
            503,
            504,
            521,
            522,
            524,
          ],
          httpMethodsToRetry: ['GET', 'PUT'] as HttpMethod[],
        },
        3,
        3,
        200,
        { 'test-header': 'test-value' },
        undefined,
      ],
      [
        'calculate retry wait time by setting timeoutError',
        0,
        {
          maxNumberOfRetries: 3,
          retryOnTimeout: false,
          retryInterval: 1,
          maximumRetryWaitTime: 3,
          backoffFactor: 2,
          httpStatusCodesToRetry: [
            408,
            413,
            429,
            500,
            502,
            503,
            504,
            521,
            522,
            524,
          ],
          httpMethodsToRetry: ['GET', 'PUT'] as HttpMethod[],
        },
        3,
        0,
        500,
        { 'test-header': 'test-value' },
        {
          message: 'The client did not produce the result within the time',
          name: 'TimeoutError',
        },
      ],
      [
        'calculate retry wait time by setting retry-after header in string',
        0,
        {
          maxNumberOfRetries: 1,
          retryOnTimeout: false,
          retryInterval: 1,
          maximumRetryWaitTime: 3,
          backoffFactor: 2,
          httpStatusCodesToRetry: [
            408,
            413,
            429,
            500,
            502,
            503,
            504,
            521,
            522,
            524,
          ],
          httpMethodsToRetry: ['GET', 'PUT'] as HttpMethod[],
        },
        10,
        0,
        200,
        { 'retry-after': 'test-string-value' },
        undefined,
      ],
      [
        'calculate retry wait time by setting undefined headers and httpCode',
        0,
        {
          maxNumberOfRetries: 3,
          retryOnTimeout: false,
          retryInterval: 1,
          maximumRetryWaitTime: 3,
          backoffFactor: 2,
          httpStatusCodesToRetry: [
            408,
            413,
            429,
            500,
            502,
            503,
            504,
            521,
            522,
            524,
          ],
          httpMethodsToRetry: ['GET', 'PUT'] as HttpMethod[],
        },
        3,
        0,
        undefined,
        undefined,
        undefined,
      ],
    ])(
      '%s',
      (
        _: string,
        expectedResult: number,
        retryConfig: RetryConfiguration,
        allowedWaitTime: number,
        retryCount: number,
        httpCode?: number,
        headers?: Record<string, string>,
        timeoutError?: Error
      ) => {
        const waitTime = getRetryWaitTime(
          retryConfig,
          allowedWaitTime,
          retryCount,
          httpCode,
          headers,
          timeoutError
        );
        expect(Math.floor(waitTime)).toStrictEqual(expectedResult);
      }
    );
  });
});
