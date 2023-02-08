import {
  HttpClientInterface,
  createRequestBuilderFactory,
  skipEncode,
} from '../../src/http/requestBuilder';
import {
  AuthenticatorInterface,
  HttpMethod,
  HttpRequest,
  HttpResponse,
  passThroughInterceptor,
  RequestOptions,
  RetryConfiguration,
} from '../../src/coreInterfaces';
import { ApiError } from '../../src/errors/apiError';
import { RequestRetryOption } from '../../src/http/retryConfiguration';
import { employeeSchema, Employee } from '../../../schema/test/employeeSchema';
import { array, number, string } from '../../../schema';
import {
  FORM_URLENCODED_CONTENT_TYPE,
  TEXT_CONTENT_TYPE,
} from '../../src/http/httpHeaders';
import { FileWrapper } from '../../src/fileWrapper';
import fs from 'fs';
import path from 'path';
import { bossSchema } from '../../../schema/test/bossSchema';

describe('test default request builder behavior with succesful responses', () => {
  const authParams = {
    username: 'maryam-adnan',
    password: '12345678',
  };
  const retryConfig: RetryConfiguration = {
    maxNumberOfRetries: 3,
    retryOnTimeout: false,
    retryInterval: 1,
    maximumRetryWaitTime: 3,
    backoffFactor: 2,
    httpStatusCodesToRetry: [408, 413, 429, 500, 502, 503, 504, 521, 522, 524],
    httpMethodsToRetry: ['GET', 'PUT'] as HttpMethod[],
  };
  const basicAuth = mockBasicAuthenticationInterface(authParams);
  const defaultRequestBuilder = createRequestBuilderFactory<string, boolean>(
    mockHttpClientAdapter(),
    (server) => mockBaseURIProvider(server),
    ApiError,
    basicAuth,
    retryConfig
  );

  it('should test request builder configured with text request body and text response body', async () => {
    const expectedRequest: HttpRequest = {
      method: 'GET',
      url: 'http://apimatic.hopto.org:3000/test/requestBuilder?text=true',
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'test-header1': 'test-value1',
        'test-header2': 'test-value2',
        'test-header3': 'test-value3',
      },
      body: {
        content: 'testBody',
        type: 'text',
      },
      auth: { username: 'maryam-adnan', password: '12345678' },
    };
    const reqBuilder = defaultRequestBuilder('GET');
    reqBuilder.appendPath('/test/requestBuilder');
    reqBuilder.baseUrl('default');
    reqBuilder.header('test-header1', 'test-value1');
    reqBuilder.headers({
      'test-header2': 'test-value2',
      'test-header3': 'test-value3',
    });
    reqBuilder.query('text', true);
    reqBuilder.requestRetryOption(RequestRetryOption.Disable);
    reqBuilder.authenticate(true);
    reqBuilder.text('testBody');
    const apiResponse = await reqBuilder.callAsText();
    const apiResponseForOptionalText = await reqBuilder.callAsOptionalText();
    expect(apiResponse).toEqual({
      request: expectedRequest,
      statusCode: 200,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'test-header1': 'test-value1',
        'test-header2': 'test-value2',
        'test-header3': 'test-value3',
      },
      result: 'testBody result',
      body: 'testBody result',
    });
    expect(apiResponseForOptionalText).toEqual({
      request: expectedRequest,
      statusCode: 200,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'test-header1': 'test-value1',
        'test-header2': 'test-value2',
        'test-header3': 'test-value3',
      },
      result: 'testBody result',
      body: 'testBody result',
    });
  });
  it('should test request builder configured with json request body and text response body', async () => {
    const expectedRequest: HttpRequest = {
      method: 'GET',
      url: 'http://apimatic.hopto.org:3000/test/requestBuilder?json=true',
      headers: {
        'content-type': 'application/json',
        'test-header1': 'test-value1',
        'test-header2': 'test-value2',
        'test-header3': 'test-value3',
      },
      body: {
        content: '{"params":["name","field","address","designation"]}',
        type: 'text',
      },
      auth: { username: 'maryam-adnan', password: '12345678' },
    };

    const reqBuilder = defaultRequestBuilder('GET');
    reqBuilder.baseUrl('default');
    reqBuilder.appendPath('/test/requestBuilder');
    reqBuilder.header('test-header1', 'test-value1');
    reqBuilder.headers({
      'test-header2': 'test-value2',
      'test-header3': 'test-value3',
    });
    reqBuilder.query('json', true);
    reqBuilder.requestRetryOption(RequestRetryOption.Disable);
    reqBuilder.authenticate(true);
    reqBuilder.json({ params: ['name', 'field', 'address', 'designation'] });
    const apiResponse = await reqBuilder.callAsText();
    expect(apiResponse).toEqual({
      request: expectedRequest,
      statusCode: 200,
      headers: {
        'content-type': TEXT_CONTENT_TYPE,
        'test-header1': 'test-value1',
        'test-header2': 'test-value2',
        'test-header3': 'test-value3',
      },
      result: 'testBody result',
      body: 'testBody result',
    });
  });
  it('should test request builder configured with form request body and json response body', async () => {
    const expectedRequest: HttpRequest = {
      method: 'GET',
      url: 'http://apimatic.hopto.org:3000/test/requestBuilder?form=true',
      headers: { 'test-header': 'test-value' },
      body: {
        content: [
          { key: 'integers[0]', value: '1' },
          { key: 'integers[1]', value: '2' },
          { key: 'integers[2]', value: '3' },
          { key: 'strings[0]', value: 'param1' },
          { key: 'strings[1]', value: 'param2' },
          { key: 'model[department]', value: 'IT' },
        ],
        type: 'form',
      },
      auth: { username: 'maryam-adnan', password: '12345678' },
    };

    const employee: Employee = {
      department: 'IT',
    };
    const strings = ['param1', 'param2'];
    const integers = [1, 2, 3];
    const reqBuilder = defaultRequestBuilder('GET');
    const mapped = reqBuilder.prepareArgs({
      integers: [integers, array(number())],
      model: [employee, employeeSchema],
      strings: [strings, array(string())],
    });
    reqBuilder.method('GET');
    reqBuilder.appendPath('/test/requestBuilder');
    reqBuilder.baseUrl('default');
    reqBuilder.header('test-header', 'test-value');
    reqBuilder.query('form', true);
    reqBuilder.deprecated(
      'EmployeesApi.listEmployees',
      'listEmployees is deprecated. use the endpoint listMembers'
    );
    reqBuilder.requestRetryOption(RequestRetryOption.Disable);
    reqBuilder.authenticate(true);
    reqBuilder.form({
      integers: mapped.integers,
      strings: mapped.strings,
      model: mapped.model,
    });
    const apiResponse = await reqBuilder.callAsJson(employeeSchema);
    expect(apiResponse).toEqual({
      request: expectedRequest,
      statusCode: 200,
      headers: {
        'test-header': 'test-value',
        accept: 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: '{ "department": "IT", "boss": { "promotedAt" : 2 }}',
      result: { department: 'IT', boss: { promotedAt: 2 } },
    });
  });
  it('should test request builder with form-data request body and json response body', async () => {
    const expectedRequest: HttpRequest = {
      method: 'GET',
      url:
        'http://apimatic.hopto.org:3000/auth/basic/test/requestBuilder?form-data=true',
      headers: {
        'test-header': 'test-value',
        accept: 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: {
        content: [
          { key: 'integers[0]', value: '1' },
          { key: 'integers[1]', value: '2' },
          { key: 'integers[2]', value: '3' },
          { key: 'strings[0]', value: 'param1' },
          { key: 'strings[1]', value: 'param2' },
          { key: 'model[department]', value: 'IT' },
        ],
        type: 'form-data',
      },
      auth: { username: 'maryam-adnan', password: '12345678' },
    };

    const employee: Employee = {
      department: 'IT',
    };
    const strings = ['param1', 'param2'];
    const integers = [1, 2, 3];
    const reqBuilder = defaultRequestBuilder('GET', '/auth/basic');
    const mapped = reqBuilder.prepareArgs({
      integers: [integers, array(number())],
      model: [employee, employeeSchema],
      strings: [strings, array(string())],
    });
    reqBuilder.appendPath('/test/requestBuilder');
    reqBuilder.baseUrl('default');
    reqBuilder.header('test-header', 'test-value');
    reqBuilder.query('form-data', true);
    reqBuilder.requestRetryOption(RequestRetryOption.Disable);
    reqBuilder.authenticate(true);
    reqBuilder.formData({
      integers: mapped.integers,
      strings: mapped.strings,
      model: mapped.model,
    });
    reqBuilder.acceptJson();
    reqBuilder.contentType('application/x-www-form-urlencoded');
    const apiResponse = await reqBuilder.callAsJson(employeeSchema);
    expect(apiResponse).toEqual({
      request: expectedRequest,
      statusCode: 200,
      headers: {
        'test-header': 'test-value',
        accept: 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: '{ "department": "IT", "boss": { "promotedAt" : 2 }}',
      result: { department: 'IT', boss: { promotedAt: 2 } },
    });
  });
  it('should test request builder to test stream request body(file) and stream response body(blob)', async () => {
    const request: HttpRequest = {
      method: 'GET',
      url: 'http://apimatic.hopto.org:3000/test/requestBuilder',
      headers: { 'test-header': 'test-value' },
      auth: { username: 'maryam-adnan', password: '12345678' },
    };
    const file = new FileWrapper(
      fs.createReadStream(path.join(__dirname, '../dummy_file.txt')),
      {
        contentType: 'application/x-www-form-urlencoded',
        filename: 'dummy_file',
        headers: { 'test-header': 'test-value' },
      }
    );
    const reqBuilder = defaultRequestBuilder('GET', '/test/requestBuilder');
    reqBuilder.baseUrl('default');
    reqBuilder.header('test-header', 'test-value');
    reqBuilder.stream(file);
    reqBuilder.requestRetryOption(RequestRetryOption.Disable);
    reqBuilder.authenticate(true);
    reqBuilder.accept('application/octet-stream');
    const apiResponse = await reqBuilder.callAsStream();
    expect(apiResponse).toMatchObject({
      request: { ...request, headers: { 'test-header': 'test-value' } },
      statusCode: 200,
      headers: { 'test-header': 'test-value' },
    });
  });
  it('should test request builder configured with text request body and text response body', async () => {
    const expectedRequest: HttpRequest = {
      method: 'GET',
      url: 'http://apimatic.hopto.org:3000/test/requestBuilder?text=true',
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'test-header1': 'test-value1',
        'test-header2': 'test-value2',
        'test-header3': 'test-value3',
      },
      body: {
        content: 'testBody',
        type: 'text',
      },
      auth: { username: 'maryam-adnan', password: '12345678' },
    };
    const reqBuilder = defaultRequestBuilder('GET');
    reqBuilder.appendPath('/test/requestBuilder');
    reqBuilder.baseUrl('default');
    reqBuilder.header('test-header1', 'test-value1');
    reqBuilder.headers({
      'test-header2': 'test-value2',
      'test-header3': 'test-value3',
    });
    reqBuilder.query('text', true);
    reqBuilder.requestRetryOption(RequestRetryOption.Disable);
    reqBuilder.authenticate(true);
    reqBuilder.text('testBody');
    const apiResponse = await reqBuilder.callAsText();
    expect(apiResponse).toEqual({
      request: expectedRequest,
      statusCode: 200,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'test-header1': 'test-value1',
        'test-header2': 'test-value2',
        'test-header3': 'test-value3',
      },
      result: 'testBody result',
      body: 'testBody result',
    });
  });
  it('should test request builder with undefined header, query, empty path', async () => {
    const reqBuilder = defaultRequestBuilder('GET', 'test/requestBuilder');
    reqBuilder.baseUrl('default');
    reqBuilder.appendPath('');
    reqBuilder.header('test-header');
    reqBuilder.query();
    reqBuilder.stream();
    const request = reqBuilder.toRequest();
    expect(request.headers).toEqual({});
    expect(request.auth).toBeUndefined();
    expect(request.body).toBeUndefined();
    expect(request.body).toBeUndefined();
    expect(request.url).toEqual(
      'http://apimatic.hopto.org:3000/test/requestBuilder'
    );
  });
  it('should test request builder error factory with incorrect text response body', async () => {
    try {
      const reqBuilder = defaultRequestBuilder(
        'GET',
        '/test/requestBuilder/errorResponse'
      );
      reqBuilder.baseUrl('default');
      reqBuilder.text('testBody');
      reqBuilder.defaultToError(ApiError);
      reqBuilder.validateResponse(false);
      await reqBuilder.callAsText();
    } catch (error) {
      const expectedResult = 'Could not parse body as string.';
      expect(error.message).toEqual(expectedResult);
    }
  });
  it('should test request builder error factory with incorrect optional text response body', async () => {
    const reqBuilder = defaultRequestBuilder(
      'GET',
      '/test/requestBuilder/errorResponse'
    );
    reqBuilder.baseUrl('default');
    reqBuilder.text('testBody');
    reqBuilder.defaultToError(ApiError);
    reqBuilder.validateResponse(false);
    const apiResponse = await reqBuilder.callAsOptionalText();
    expect(apiResponse.result).toBeUndefined();
  });
  it('should test request builder error factory with response body being empty string', async () => {
    try {
      const reqBuilder = defaultRequestBuilder(
        'GET',
        '/test/requestBuilder/errorResponse'
      );
      reqBuilder.baseUrl('default');
      reqBuilder.defaultToError(ApiError);
      reqBuilder.validateResponse(false);
      await reqBuilder.callAsJson(employeeSchema);
    } catch (error) {
      const expectedResult =
        'Could not parse body as JSON. The response body is empty.';
      expect(error.message).toEqual(expectedResult);
    }
  });
  it('should test request builder error factory with incorrect json response body', async () => {
    try {
      const reqBuilder = defaultRequestBuilder(
        'GET',
        '/test/requestBuilder/errorResponse'
      );
      reqBuilder.baseUrl('default');
      const employee: Employee = {
        department: 'IT',
      };
      const mapped = reqBuilder.prepareArgs({
        model: [employee, employeeSchema],
      });

      reqBuilder.formData({
        model: mapped.model,
      });
      reqBuilder.defaultToError(ApiError);
      reqBuilder.validateResponse(false);
      await reqBuilder.callAsJson(employeeSchema);
    } catch (error) {
      const expectedResult =
        'Could not parse body as JSON.\n\nExpected \'r\' instead of \'e\'';
      expect(error.message).toEqual(expectedResult);
    }
  });
  it('should test request builder error factory with response body not a string', async () => {
    const reqBuilder = defaultRequestBuilder(
      'GET',
      '/test/requestBuilder/errorResponse'
    );
    try {
      reqBuilder.baseUrl('default');
      reqBuilder.text('testBody');
      await reqBuilder.callAsJson(employeeSchema);
    } catch (error) {
      const expectedResult =
        "Could not parse body as JSON.\n\nExpected 'r' instead of 'e'";
      expect(error.message).toEqual(expectedResult);
    }
  });
  it('should test request builder error factory with json response mapping to incorect schema', async () => {
    try {
      const reqBuilder = defaultRequestBuilder('GET', '/test/requestBuilder');
      reqBuilder.baseUrl('default');
      const employee: Employee = {
        department: 'IT',
      };
      const mapped = reqBuilder.prepareArgs({
        model: [employee, employeeSchema],
      });

      reqBuilder.formData({
        model: mapped.model,
      });
      reqBuilder.defaultToError(ApiError);
      reqBuilder.validateResponse(false);
      await reqBuilder.callAsJson(bossSchema);
    } catch (error) {
      const expectedResult = 'The response did not match the response schema.';
      expect(error.message.startsWith(expectedResult)).toBeTruthy();
    }
  });
  it('should test request builder with 400 response code', async () => {
    try {
      const reqBuilder = defaultRequestBuilder(
        'GET',
        '/test/requestBuilder/errorResponse'
      );
      reqBuilder.baseUrl('default');
      await reqBuilder.callAsText();
    } catch (error) {
      expect(error.message).toEqual(`Response status code was not ok: 400.`);
    }
  });

  function mockBasicAuthenticationInterface({
    username,
    password,
  }: {
    username: string;
    password: string;
  }): AuthenticatorInterface<boolean> {
    return (requiresAuth?: boolean) => {
      if (!requiresAuth) {
        return passThroughInterceptor;
      }

      return (request, options, next) => {
        request.auth = {
          username,
          password,
        };

        return next(request, options);
      };
    };
  }

  function mockHttpClientAdapter(): HttpClientInterface {
    return async (request, requestOptions) => {
      const iserrorResponse = request.url.startsWith(
        'http://apimatic.hopto.org:3000/test/requestBuilder/errorResponse'
      );

      if (iserrorResponse) {
        return await mockErrorResponse(request, requestOptions);
      }
      return await mockResponse(request, requestOptions);
    };
  }

  function mockResponse(
    req: HttpRequest,
    reqOptions?: RequestOptions
  ): HttpResponse {
    const contentType = req.body?.type;
    const statusCode = reqOptions?.abortSignal?.aborted ? 400 : 200;
    let response: HttpResponse = {
      statusCode: 200,
      body: 'bodyResult',
      headers: req.headers ?? {},
    };

    if (contentType === 'text') {
      response = {
        statusCode,
        body: 'testBody result',
        headers: { ...req.headers, 'content-type': TEXT_CONTENT_TYPE },
      } as HttpResponse;
    }
    if (contentType === 'form' || contentType === 'form-data') {
      response = {
        statusCode,
        body: '{ "department": "IT", "boss": { "promotedAt" : 2 }}',
        headers: {
          ...req.headers,
          'content-type': FORM_URLENCODED_CONTENT_TYPE,
        },
      } as HttpResponse;
    }
    if (contentType === 'stream') {
      response = {
        statusCode,
        body: new Blob(['I have dummy data'], {
          type: 'application/x-www-form-urlencoded',
        }),
        headers: { ...req.headers, 'content-type': 'application/octet-stream' },
      } as HttpResponse;
    }
    return response;
  }

  function mockErrorResponse(
    req: HttpRequest,
    reqOptions?: RequestOptions
  ): HttpResponse {
    const contentType = req.body?.type;
    const statusCode = reqOptions?.abortSignal?.aborted ? 400 : 200;
    let response: HttpResponse = {
      statusCode: 200,
      body: '',
      headers: req.headers ?? {},
    };

    if (contentType === 'form' || contentType === 'form-data') {
      response = {
        statusCode,
        body: 'testBody result',
        headers: {
          ...req.headers,
          'content-type': FORM_URLENCODED_CONTENT_TYPE,
        },
      } as HttpResponse;
    }
    if (contentType === 'stream') {
      response = {
        statusCode,
        body: '{ "department": "IT", "boss": { "promotedAt" : 2 }}',
        headers: { ...req.headers, 'content-type': 'application/octet-stream' },
      } as HttpResponse;
    }
    if (contentType === 'text') {
      response = {
        statusCode,
        body: new Blob(['I have dummy data'], {
          type: 'application/x-www-form-urlencoded',
        }),
        headers: { ...req.headers, 'content-type': TEXT_CONTENT_TYPE },
      } as HttpResponse;
    }
    return response;
  }
});
it('should test skipEncode instance', () => {
  expect(skipEncode('test-value')).toEqual({ value: 'test-value' });
});

describe('test default request builder behavior to test retries', () => {
  const retryConfig: RetryConfiguration = {
    maxNumberOfRetries: 2,
    retryOnTimeout: true,
    retryInterval: 1,
    maximumRetryWaitTime: 3,
    backoffFactor: 2,
    httpStatusCodesToRetry: [408, 413, 429, 500, 502, 503, 504, 521, 522, 524],
    httpMethodsToRetry: ['GET', 'PUT'] as HttpMethod[],
  };
  const noneAuthenticationProvider = () => passThroughInterceptor;
  const defaultRequestBuilder = createRequestBuilderFactory<string, boolean>(
    mockHttpClientAdapterToTestRetries(),
    (server) => mockBaseURIProvider(server),
    ApiError,
    noneAuthenticationProvider,
    retryConfig
  );

  it('should test request builder with retries and response returning 500 error code', async () => {
    try {
      const reqBuilder = defaultRequestBuilder(
        'GET',
        '/test/requestBuilder/errorResponse'
      );
      reqBuilder.baseUrl('default');
      await reqBuilder.callAsText();
    } catch (error) {
      expect(error.message).toEqual(
        'Time out error against http method GET and status code 500'
      );
    }
  });

  it('should test request builder with throwOn', async () => {
    try {
      const reqBuilder = defaultRequestBuilder(
        'GET',
        '/test/requestBuilder/errorResponse'
      );
      reqBuilder.baseUrl('default');
      reqBuilder.text('result');
      await reqBuilder.throwOn(
        400,
        true,
        ApiError,
        'Global Error template 500: {$statusCode}, accept => {$response.header.content-type}, body => {$response.body}.'
      );
      await reqBuilder.throwOn(
        400,
        false,
        ApiError,
        'Server responded with a bad request'
      );
      await reqBuilder.throwOn(
        [400, 500],
        true,
        ApiError,
        'Global Error template 500: {$statusCode}, accept => {$response.header.content-type}, body => {$response.body}.'
      );
    } catch (error) {
      expect(error.message).toEqual(
        'Time out error against http method GET and status code 500'
      );
    }
  });

  function mockHttpClientAdapterToTestRetries(): HttpClientInterface {
    return async (request, requestOptions) => {
      if (request.body?.type === 'text') {
        return {
          statusCode: 400,
          headers: {},
        } as HttpResponse;
      }
      const statusCode = requestOptions?.abortSignal?.aborted ? 400 : 500;
      throw new Error(
        `Time out error against http method ${request.method} and status code ${statusCode}`
      );
    };
  }
});

function mockBaseURIProvider(server: string | undefined) {
  if (server === 'default') {
    return 'http://apimatic.hopto.org:3000/';
  }
  if (server === 'auth server') {
    return 'http://apimaticauth.hopto.org:3000/';
  }
  return '';
}
