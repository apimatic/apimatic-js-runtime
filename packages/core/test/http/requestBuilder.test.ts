import {
  RequestBuilder,
  createRequestBuilderFactory,
  skipEncode,
} from '../../src/http/requestBuilder';
import {
  AuthenticatorInterface,
  HttpClientInterface,
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
import { boolean, nullable, optional } from '@apimatic/schema/src';
import {
  ArrayPrefixFunction,
  commaPrefix,
  indexedPrefix,
  pipePrefix,
  plainPrefix,
  tabPrefix,
  unindexedPrefix,
} from '@apimatic/http-query';

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
  const noContentResponse: HttpResponse = {
    statusCode: 204,
    body: '',
    headers: {},
  };
  const whitespacedResponse: HttpResponse = {
    statusCode: 204,
    body: '  ',
    headers: {},
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
      url: 'https://apimatic.hopto.org:3000/test/requestBuilder?text=true',
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
      url: 'https://apimatic.hopto.org:3000/test/requestBuilder?json=true',
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
      url: 'https://apimatic.hopto.org:3000/test/requestBuilder?form=true',
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
        'https://apimatic.hopto.org:3000/auth/basic/test/requestBuilder?form-data=true',
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
      url: 'https://apimatic.hopto.org:3000/test/requestBuilder',
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
      url: 'https://apimatic.hopto.org:3000/test/requestBuilder?text=true',
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
  it('should test request builder with undefined and null header, query, empty path', async () => {
    const reqBuilder = defaultRequestBuilder('GET', 'test/requestBuilder');
    reqBuilder.baseUrl('default');
    reqBuilder.appendPath('');
    reqBuilder.header('test-header');
    reqBuilder.header('test-header', null);
    reqBuilder.query();
    reqBuilder.stream();
    const request = reqBuilder.toRequest();
    expect(request.headers).toEqual({});
    expect(request.auth).toBeUndefined();
    expect(request.body).toBeUndefined();
    expect(request.body).toBeUndefined();
    expect(request.url).toEqual(
      'https://apimatic.hopto.org:3000/test/requestBuilder'
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
      const expectedResult = `Could not parse body as JSON.\n\nExpected 'r' instead of 'e'`;
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
        'Could not parse body as JSON. The response body is not a string.';
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
  it('should test response with no content textual types', async () => {
    const reqBuilder = customRequestBuilder(noContentResponse);
    const { result } = await reqBuilder.callAsText();
    expect(result).toEqual('');
  });
  it('should test response with whitespace content textual types', async () => {
    const reqBuilder = customRequestBuilder(whitespacedResponse);
    const { result } = await reqBuilder.callAsText();
    expect(result).toEqual('  ');
  });
  it('should test response with no content string cases', async () => {
    const reqBuilder = customRequestBuilder(noContentResponse);
    const nullableString = await reqBuilder.callAsJson(nullable(string()));
    expect(nullableString.result).toEqual(null);

    const optionalString = await reqBuilder.callAsJson(optional(string()));
    expect(optionalString.result).toEqual(undefined);
  });
  it('should test response with whitespace content string cases', async () => {
    const reqBuilder = customRequestBuilder(whitespacedResponse);
    const nullableString = await reqBuilder.callAsJson(nullable(string()));
    expect(nullableString.result).toEqual(null);

    const optionalString = await reqBuilder.callAsJson(optional(string()));
    expect(optionalString.result).toEqual(undefined);
  });
  it('should test response with no content boolean cases', async () => {
    const reqBuilder = customRequestBuilder(noContentResponse);
    const nullableString = await reqBuilder.callAsJson(nullable(boolean()));
    expect(nullableString.result).toEqual(null);

    const optionalString = await reqBuilder.callAsJson(optional(boolean()));
    expect(optionalString.result).toEqual(undefined);
  });
  it('should test response with whitespace content boolean cases', async () => {
    const reqBuilder = customRequestBuilder(whitespacedResponse);
    const nullableString = await reqBuilder.callAsJson(nullable(boolean()));
    expect(nullableString.result).toEqual(null);

    const optionalString = await reqBuilder.callAsJson(optional(boolean()));
    expect(optionalString.result).toEqual(undefined);
  });
  it('should test response with no content object cases', async () => {
    const reqBuilder = customRequestBuilder(noContentResponse);
    const nullableString = await reqBuilder.callAsJson(
      nullable(employeeSchema)
    );
    expect(nullableString.result).toEqual(null);

    const optionalString = await reqBuilder.callAsJson(
      optional(employeeSchema)
    );
    expect(optionalString.result).toEqual(undefined);
  });
  it('should test response with whitespace content object cases', async () => {
    const reqBuilder = customRequestBuilder(whitespacedResponse);
    const nullableString = await reqBuilder.callAsJson(
      nullable(employeeSchema)
    );
    expect(nullableString.result).toEqual(null);

    const optionalString = await reqBuilder.callAsJson(
      optional(employeeSchema)
    );
    expect(optionalString.result).toEqual(undefined);
  });

  it('should test request builder query indexedPrefix parameters with number, string, bool and BigInt', async () => {
    const expectedRequestUrl =
      'https://apimatic.hopto.org:3000/test/requestBuilder?number=12345&string=string&bool=true&biginit=12345';

    const reqBuilder = defaultRequestBuilder('GET');
    reqBuilder.appendPath('/test/requestBuilder');
    reqBuilder.baseUrl('default');
    reqBuilder.query('number', 12345);
    reqBuilder.query('string', 'string');
    reqBuilder.query('bool', true);
    reqBuilder.query('biginit', BigInt(12345));

    const apiResponse = await reqBuilder.callAsText();
    expect(apiResponse.request.url).toEqual(expectedRequestUrl);
  });

  it('should test request builder query indexedPrefix parameters with array', async () => {
    const expectedRequestUrl =
      'https://apimatic.hopto.org:3000/test/requestBuilder?array%5B0%5D=item1&array%5B1%5D=item2';

    const reqBuilder = buildRequestWithArrayQuery(indexedPrefix);

    const apiResponse = await reqBuilder.callAsText();
    expect(apiResponse.request.url).toEqual(expectedRequestUrl);
  });

  it('should test request builder query unindexedPrefix parameters with array', async () => {
    const expectedRequestUrl =
      'https://apimatic.hopto.org:3000/test/requestBuilder?array%5B%5D=item1&array%5B%5D=item2';

    const reqBuilder = buildRequestWithArrayQuery(unindexedPrefix);

    const apiResponse = await reqBuilder.callAsText();
    expect(apiResponse.request.url).toEqual(expectedRequestUrl);
  });

  it('should test request builder query plainPrefix parameters with array', async () => {
    const expectedRequestUrl =
      'https://apimatic.hopto.org:3000/test/requestBuilder?array=item1&array=item2';

    const reqBuilder = buildRequestWithArrayQuery(plainPrefix);

    const apiResponse = await reqBuilder.callAsText();
    expect(apiResponse.request.url).toEqual(expectedRequestUrl);
  });

  it('should test request builder query tabPrefix parameters with array', async () => {
    const expectedRequestUrl =
      'https://apimatic.hopto.org:3000/test/requestBuilder?array=item1%09item2';

    const reqBuilder = buildRequestWithArrayQuery(tabPrefix);

    const apiResponse = await reqBuilder.callAsText();
    expect(apiResponse.request.url).toEqual(expectedRequestUrl);
  });

  it('should test request builder query commaPrefix parameters with array', async () => {
    const expectedRequestUrl =
      'https://apimatic.hopto.org:3000/test/requestBuilder?array=item1%2Citem2';

    const reqBuilder = buildRequestWithArrayQuery(commaPrefix);

    const apiResponse = await reqBuilder.callAsText();
    expect(apiResponse.request.url).toEqual(expectedRequestUrl);
  });

  it('should test request builder query pipePrefix parameters with array', async () => {
    const expectedRequestUrl =
      'https://apimatic.hopto.org:3000/test/requestBuilder?array=item1%7Citem2';

    const reqBuilder = buildRequestWithArrayQuery(pipePrefix);

    const apiResponse = await reqBuilder.callAsText();
    expect(apiResponse.request.url).toEqual(expectedRequestUrl);
  });

  function buildRequestWithArrayQuery(prefixFormat: ArrayPrefixFunction) {
    const reqBuilder = defaultRequestBuilder('GET');
    reqBuilder.appendPath('/test/requestBuilder');
    reqBuilder.baseUrl('default');
    reqBuilder.query('array', ['item1', 'item2'], prefixFormat);

    return reqBuilder;
  }

  it('should test request builder query parameters with complex object', async () => {
    const expectedRequestUrl =
      'https://apimatic.hopto.org:3000/test/requestBuilder?object%5Bkey1%5D=value1&object%5Bkey2%5D=value2&object%5Bkey3%5D%5Bsubkey%5D=12345&object%5Bkey4%5D%5B0%5D=item1&object%5Bkey4%5D%5B1%5D=item2';

    const reqBuilder = defaultRequestBuilder('GET');
    reqBuilder.appendPath('/test/requestBuilder');
    reqBuilder.baseUrl('default');
    reqBuilder.query('object', {
      key1: 'value1',
      key2: 'value2',
      key3: {
        subkey: 12345,
      },
      key4: ['item1', 'item2'],
    });

    const apiResponse = await reqBuilder.callAsText();
    expect(apiResponse.request.url).toEqual(expectedRequestUrl);
  });

  it('should test request builder query with multiple parameters and prefix format', async () => {
    const reqBuilder = defaultRequestBuilder('GET');
    reqBuilder.appendPath('/test/requestBuilder');
    reqBuilder.baseUrl('default');
    reqBuilder.query('array1', ['item1', 'item2'], indexedPrefix);

    const prefixFormats = (reqBuilder as any)._queryParamsPrefixFormat;
    expect(prefixFormats.array1).toBe(indexedPrefix);
  });

  it('should test request builder configured with all kind of headers', async () => {
    const reqBuilder = defaultRequestBuilder('GET', '/test/requestBuilder');
    reqBuilder.baseUrl('default');
    reqBuilder.header('test-header-missing1');
    reqBuilder.header('test-header-missing2', null);
    reqBuilder.header('test-header1', 'test-value\'"\n1');
    reqBuilder.header('test-header2', true);
    reqBuilder.header('test-header3', false);
    reqBuilder.header('test-header4', 12345);
    reqBuilder.header('test-header5', BigInt(12345));
    reqBuilder.header('test-header6', { key: 'v a l u e' });
    reqBuilder.header('test-header7', Symbol());

    const apiResponse = await reqBuilder.callAsText();
    expect(apiResponse.request.headers).toEqual({
      'test-header1': 'test-value\'"\n1',
      'test-header2': 'true',
      'test-header3': 'false',
      'test-header4': '12345',
      'test-header5': '12345',
      'test-header6': '{"key":"v a l u e"}',
      'test-header7': 'Symbol()',
    });
  });

  function customRequestBuilder(
    response: HttpResponse
  ): RequestBuilder<string, boolean> {
    const reqBuilder = createRequestBuilderFactory<string, boolean>(
      mockHttpClientAdapter(response),
      (server) => mockBaseURIProvider(server),
      ApiError,
      basicAuth,
      retryConfig
    )('GET', '/test/requestBuilder');
    reqBuilder.baseUrl('default');
    return reqBuilder;
  }

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

  function mockHttpClientAdapter(
    customResponse?: HttpResponse
  ): HttpClientInterface {
    return async (request, requestOptions) => {
      if (typeof customResponse !== 'undefined') {
        return customResponse;
      }
      const iserrorResponse = request.url.startsWith(
        'https://apimatic.hopto.org:3000/test/requestBuilder/errorResponse'
      );

      if (iserrorResponse) {
        return mockErrorResponse(request, requestOptions);
      }
      return mockResponse(request, requestOptions);
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

  describe('template function tests', () => {
    it('should replace template parameters in path with provided values', async () => {
      const expectedRequestUrl =
        'https://apimatic.hopto.org:3000/users/123/posts/456';

      const reqBuilder = defaultRequestBuilder('GET');
      reqBuilder.appendPath('/users/{userId}/posts/{postId}');
      reqBuilder.baseUrl('default');

      reqBuilder.template('userId', '123');
      reqBuilder.template('postId', '456');

      const apiResponse = await reqBuilder.callAsText();
      expect(apiResponse.request.url).toEqual(expectedRequestUrl);
    });

    it('should handle template parameters with different types', async () => {
      const expectedRequestUrl =
        'https://apimatic.hopto.org:3000/data/123/true/3.14';

      const reqBuilder = defaultRequestBuilder('GET');
      reqBuilder.appendPath('/data/{number}/{boolean}/{float}');
      reqBuilder.baseUrl('default');

      reqBuilder.template('number', 123);
      reqBuilder.template('boolean', true);
      reqBuilder.template('float', 3.14);

      const apiResponse = await reqBuilder.callAsText();
      expect(apiResponse.request.url).toEqual(expectedRequestUrl);
    });

    it('should handle multiple template parameters in the same path segment', async () => {
      const expectedRequestUrl =
        'https://apimatic.hopto.org:3000/org/123/dept/456/emp/789';

      const reqBuilder = defaultRequestBuilder('GET');
      reqBuilder.appendPath('/org/{orgId}/dept/{deptId}/emp/{empId}');
      reqBuilder.baseUrl('default');

      reqBuilder.template('orgId', '123');
      reqBuilder.template('deptId', '456');
      reqBuilder.template('empId', '789');

      const apiResponse = await reqBuilder.callAsText();
      expect(apiResponse.request.url).toEqual(expectedRequestUrl);
    });
  });

  describe('updateParameterByJsonPointer tests', () => {
    it('should update request body object using JSON pointer', async () => {
      const reqBuilder = defaultRequestBuilder('GET');
      reqBuilder.appendPath('/test/requestBuilder');
      reqBuilder.baseUrl('default');

      // Set initial JSON body
      reqBuilder.json({
        user: {
          name: 'John',
          age: 30,
          address: {
            city: 'New York',
          },
        },
      });

      // Update nested value using JSON pointer
      reqBuilder.updateParameterByJsonPointer(
        '$request.body#/user/address/city',
        () => 'Boston'
      );

      const apiResponse = await reqBuilder.callAsText();
      expect(apiResponse.request.body).toBeDefined();
      expect(apiResponse.request.body?.type).toBe('text');
      const requestBody = JSON.parse(
        apiResponse.request.body?.content as string
      );
      expect(requestBody.user.address.city).toBe('Boston');
    });

    it('should update request body string using JSON pointer', async () => {
      const reqBuilder = defaultRequestBuilder('GET');
      reqBuilder.appendPath('/test/requestBuilder');
      reqBuilder.baseUrl('default');

      // Set initial JSON body
      reqBuilder.text('NewYork');

      // Update nested value using JSON pointer
      reqBuilder.updateParameterByJsonPointer('$request.body', () => 'Boston');

      const apiResponse = await reqBuilder.callAsText();
      expect(apiResponse.request.body).toBeDefined();
      expect(apiResponse.request.body?.type).toBe('text');
      const requestBody = apiResponse.request.body?.content as string;
      expect(requestBody).toBe('Boston');
    });

    it('should update form using JSON pointer', async () => {
      const reqBuilder = defaultRequestBuilder('GET');
      reqBuilder.appendPath('/test/requestBuilder');
      reqBuilder.baseUrl('default');

      // Set initial form data
      reqBuilder.form({
        user: {
          name: 'John',
          age: '30',
          address: {
            city: 'New York',
          },
        },
      });

      // Update nested value using JSON pointer
      reqBuilder.updateParameterByJsonPointer(
        '$request.body#/user/address/city',
        () => 'Boston'
      );

      const apiResponse = await reqBuilder.callAsText();
      expect(apiResponse.request.body).toBeDefined();
      expect(apiResponse.request.body?.type).toBe('form');
      const form = apiResponse.request.body?.content as Array<{
        key: string;
        value: string;
      }>;
      const cityField = form.find(
        (field) => field.key === 'user[address][city]'
      );
      expect(cityField?.value).toBe('Boston');
    });

    it('should update form data using JSON pointer', async () => {
      const reqBuilder = defaultRequestBuilder('GET');
      reqBuilder.appendPath('/test/requestBuilder');
      reqBuilder.baseUrl('default');

      // Set initial form data
      reqBuilder.formData({
        user: {
          name: 'John',
          age: '30',
          address: {
            city: 'New York',
          },
        },
      });

      // Update nested value using JSON pointer
      reqBuilder.updateParameterByJsonPointer(
        '$request.body#/user/address/city',
        () => 'Boston'
      );

      const apiResponse = await reqBuilder.callAsText();
      expect(apiResponse.request.body).toBeDefined();
      expect(apiResponse.request.body?.type).toBe('form');
      const form = apiResponse.request.body?.content as Array<{
        key: string;
        value: string;
      }>;
      const cityField = form.find(
        (field) => field.key === 'user[address][city]'
      );
      expect(cityField?.value).toBe('Boston');
    });

    it('should update path template parameters using JSON pointer', async () => {
      const reqBuilder = defaultRequestBuilder('GET');
      reqBuilder.appendPath('/users/{userId}/posts/{postId}');
      reqBuilder.baseUrl('default');

      // Set initial template values
      reqBuilder.template('userId', '123');
      reqBuilder.template('postId', '456');

      // Update template value using JSON pointer
      reqBuilder.updateParameterByJsonPointer(
        '$request.path#/userId',
        () => '789'
      );

      const apiResponse = await reqBuilder.callAsText();
      expect(apiResponse.request.url).toBe(
        'https://apimatic.hopto.org:3000/users/789/posts/456'
      );
    });

    it('should update query parameters using JSON pointer', async () => {
      const reqBuilder = defaultRequestBuilder('GET');
      reqBuilder.appendPath('/test/requestBuilder');
      reqBuilder.baseUrl('default');

      // Set initial query parameters
      reqBuilder.query({
        filter: {
          status: 'active',
          type: 'user',
        },
      });

      // Update nested query value using JSON pointer
      reqBuilder.updateParameterByJsonPointer(
        '$request.query#/filter/status',
        () => 'inactive'
      );

      const apiResponse = await reqBuilder.callAsText();
      expect(decodeURIComponent(apiResponse.request.url)).toContain(
        'filter[status]=inactive'
      );
    });

    it('should update headers using JSON pointer', async () => {
      const reqBuilder = defaultRequestBuilder('GET');
      reqBuilder.appendPath('/test/requestBuilder');
      reqBuilder.baseUrl('default');

      // Set initial headers
      reqBuilder.headers({
        'x-api-key': 'old-key',
        'content-type': 'application/json',
      });

      // Update header value using JSON pointer
      reqBuilder.updateParameterByJsonPointer(
        '$request.headers#/x-api-key',
        () => 'new-key'
      );

      const apiResponse = await reqBuilder.callAsText();
      expect(apiResponse.request.headers).toBeDefined();
      expect(apiResponse.request.headers?.['x-api-key']).toBe('new-key');
    });

    it('should return builder instance for chaining', async () => {
      const reqBuilder = defaultRequestBuilder('GET');
      reqBuilder.appendPath('/test/requestBuilder');
      reqBuilder.baseUrl('default');

      const result = reqBuilder
        .updateParameterByJsonPointer(
          '$request.headers#/x-api-key',
          () => 'key1'
        )
        .updateParameterByJsonPointer(
          '$request.headers#/content-type',
          () => 'application/json'
        );

      expect(result).toBe(reqBuilder);
    });

    it('should handle null pointer gracefully', async () => {
      const reqBuilder = defaultRequestBuilder('GET');
      reqBuilder.appendPath('/test/requestBuilder');
      reqBuilder.baseUrl('default');

      const result = reqBuilder.updateParameterByJsonPointer(
        null,
        () => 'value'
      );
      expect(result).toBe(reqBuilder);
    });

    it('should handle invalid pointer prefix', async () => {
      const reqBuilder = defaultRequestBuilder('GET');
      reqBuilder.appendPath('/test/requestBuilder');
      reqBuilder.baseUrl('default');

      const result = reqBuilder.updateParameterByJsonPointer(
        '$invalid.prefix#/key',
        () => 'value'
      );
      expect(result).toBe(reqBuilder);
    });

    it('should handle invalid pointer key', async () => {
      const reqBuilder = defaultRequestBuilder('GET');
      reqBuilder.appendPath('/test/requestBuilder');
      reqBuilder.baseUrl('default');

      reqBuilder.updateParameterByJsonPointer(
        '$request.query#/invalid/key',
        () => 'value'
      );
      const apiResponse = await reqBuilder.callAsText();
      expect(decodeURIComponent(apiResponse.request.url)).toContain(
        'key=value'
      );
    });
  });
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
        ApiError,
        true,
        'Global Error template 500: {$statusCode}, accept => {$response.header.content-type}, body => {$response.body}.'
      );
      await reqBuilder.throwOn(
        400,
        ApiError,
        'Server responded with a bad request'
      );
      await reqBuilder.throwOn(
        [400, 500],
        ApiError,
        true,
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
    return 'https://apimatic.hopto.org:3000/';
  }
  if (server === 'auth server') {
    return 'https://apimaticauth.hopto.org:3000/';
  }
  return '';
}
