import {
  createRequestBuilderFactory,
  pathParam,
  RequestBuilder,
  skipEncode,
} from '../../src/http/requestBuilder';
import {
  AuthenticatorInterface,
  HttpClientInterface,
  HttpMethod,
  HttpRequest,
  HttpResponse,
  PagedAsyncIterable,
  passThroughInterceptor,
  RequestOptions,
  RetryConfiguration,
} from '../../src/coreInterfaces';
import { ApiError } from '../../src/errors/apiError';
import { RequestRetryOption } from '../../src/http/retryConfiguration';
import { employeeSchema, Employee } from '../../../schema/test/employeeSchema';
import { array, bigint, number, string } from '../../../schema';
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
import { ApiErrorChild } from '../errors/apiErrorChild';

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

const basicAuth = mockBasicAuthenticationInterface(authParams);

function mockBaseURIProvider(server: string | undefined) {
  if (server === 'default') {
    return 'https://apimatic.hopto.org:3000/';
  }
  if (server === 'auth server') {
    return 'https://apimaticauth.hopto.org:3000/';
  }
  return '';
}

const defaultRequestBuilder = (
  route: string | undefined = '/test/requestBuilder',
  customResponse?: HttpResponse,
  authenticatorInterface?: AuthenticatorInterface<boolean>,
  httpClientInterface?: HttpClientInterface
) => {
  const requestBuilder = createRequestBuilderFactory<string, boolean>(
    httpClientInterface ?? mockHttpClientAdapter(customResponse),
    (server) => mockBaseURIProvider(server),
    ApiError,
    authenticatorInterface ?? basicAuth,
    retryConfig
  )('GET', route);
  requestBuilder.baseUrl('default');
  return requestBuilder;
};

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

describe('test default request builder behavior with succesful responses', () => {
  function setupTextRequestTest() {
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

    const expectedResponse = {
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
    };
    const reqBuilder = defaultRequestBuilder();
    reqBuilder.header('test-header1', 'test-value1');
    reqBuilder.headers({
      'test-header2': 'test-value2',
      'test-header3': 'test-value3',
    });
    reqBuilder.query('text', true);
    reqBuilder.requestRetryOption(RequestRetryOption.Disable);
    reqBuilder.authenticate(true);
    reqBuilder.text('testBody');

    return { reqBuilder, expectedResponse };
  }

  it('should test request builder configured with text request body and text response body', async () => {
    const { reqBuilder, expectedResponse } = setupTextRequestTest();
    const apiResponse = await reqBuilder.callAsText();
    const apiResponseForOptionalText = await reqBuilder.callAsOptionalText();

    expect(apiResponse).toEqual(expectedResponse);
    expect(apiResponseForOptionalText).toEqual(expectedResponse);
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

    const reqBuilder = defaultRequestBuilder();
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

  function setupFormRequestTest(
    url: string,
    bodyType: 'form' | 'form-data',
    headers: Record<string, string> = {}
  ) {
    const expectedRequest = {
      method: 'GET',
      url,
      headers: { 'test-header': 'test-value', ...headers },
      body: {
        content: [
          { key: 'integers[0]', value: '1' },
          { key: 'integers[1]', value: '2' },
          { key: 'integers[2]', value: '3' },
          { key: 'strings[0]', value: 'param1' },
          { key: 'strings[1]', value: 'param2' },
          { key: 'model[department]', value: 'IT' },
        ],
        type: bodyType,
      },
      auth: { username: 'maryam-adnan', password: '12345678' },
    };
    const expectedResponse = {
      request: expectedRequest,
      statusCode: 200,
      headers: {
        'test-header': 'test-value',
        accept: 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: '{ "department": "IT", "boss": { "promotedAt" : 2 }}',
      result: { department: 'IT', boss: { promotedAt: 2 } },
    };
    const reqBuilder = defaultRequestBuilder();
    const mapped = reqBuilder.prepareArgs({
      integers: [[1, 2, 3], array(number())],
      model: [{ department: 'IT' } as Employee, employeeSchema],
      strings: [['param1', 'param2'], array(string())],
    });
    reqBuilder.header('test-header', 'test-value');
    reqBuilder.deprecated(
      'EmployeesApi.listEmployees',
      'listEmployees is deprecated. use the endpoint listMembers'
    );
    reqBuilder.requestRetryOption(RequestRetryOption.Disable);
    reqBuilder.authenticate(true);
    reqBuilder.query(bodyType, true);
    const body = {
      integers: mapped.integers,
      strings: mapped.strings,
      model: mapped.model,
    };

    if (bodyType === 'form') {
      reqBuilder.form(body);
    } else {
      reqBuilder.formData(body);
      reqBuilder.acceptJson();
      reqBuilder.contentType('application/x-www-form-urlencoded');
    }
    return { reqBuilder, expectedResponse };
  }

  it('should test request builder configured with form request body and json response body', async () => {
    const { reqBuilder, expectedResponse } = setupFormRequestTest(
      'https://apimatic.hopto.org:3000/test/requestBuilder?form=true',
      'form'
    );
    const apiResponse = await reqBuilder.callAsJson(employeeSchema);
    expect(apiResponse).toEqual(expectedResponse);
  });
  it('should test request builder with form-data request body and json response body', async () => {
    const { reqBuilder, expectedResponse } = setupFormRequestTest(
      'https://apimatic.hopto.org:3000/test/requestBuilder?form-data=true',
      'form-data',
      {
        accept: 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
      }
    );
    const apiResponse = await reqBuilder.callAsJson(employeeSchema);
    expect(apiResponse).toEqual(expectedResponse);
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
    const reqBuilder = defaultRequestBuilder();
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
  it('should test request builder with undefined and null header, query, empty path', async () => {
    const reqBuilder = defaultRequestBuilder();
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
  it('should test request builder error factory with incorrect optional text response body', async () => {
    const reqBuilder = defaultRequestBuilder(
      '/test/requestBuilder/errorResponse'
    );
    reqBuilder.baseUrl('default');
    reqBuilder.text('testBody');
    reqBuilder.defaultToError(ApiError);
    reqBuilder.validateResponse(false);
    const apiResponse = await reqBuilder.callAsOptionalText();
    expect(apiResponse.result).toBeUndefined();
  });

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

  it('should test response with no content textual types', async () => {
    const reqBuilder = defaultRequestBuilder(
      '/test/requestBuilder',
      noContentResponse
    );
    const { result } = await reqBuilder.callAsText();
    expect(result).toEqual('');
  });
  it('should test response with whitespace content textual types', async () => {
    const reqBuilder = defaultRequestBuilder(
      '/test/requestBuilder',
      whitespacedResponse
    );
    const { result } = await reqBuilder.callAsText();
    expect(result).toEqual('  ');
  });
  it('should test response with no content string cases', async () => {
    const reqBuilder = defaultRequestBuilder(
      '/test/requestBuilder',
      noContentResponse
    );
    const nullableString = await reqBuilder.callAsJson(nullable(string()));
    expect(nullableString.result).toEqual(null);

    const optionalString = await reqBuilder.callAsJson(optional(string()));
    expect(optionalString.result).toEqual(undefined);
  });
  it('should test response with whitespace content string cases', async () => {
    const reqBuilder = defaultRequestBuilder(
      '/test/requestBuilder',
      whitespacedResponse
    );
    const nullableString = await reqBuilder.callAsJson(nullable(string()));
    expect(nullableString.result).toEqual(null);

    const optionalString = await reqBuilder.callAsJson(optional(string()));
    expect(optionalString.result).toEqual(undefined);
  });
  it('should test response with no content boolean cases', async () => {
    const reqBuilder = defaultRequestBuilder(
      '/test/requestBuilder',
      noContentResponse
    );
    const nullableString = await reqBuilder.callAsJson(nullable(boolean()));
    expect(nullableString.result).toEqual(null);

    const optionalString = await reqBuilder.callAsJson(optional(boolean()));
    expect(optionalString.result).toEqual(undefined);
  });
  it('should test response with whitespace content boolean cases', async () => {
    const reqBuilder = defaultRequestBuilder(
      '/test/requestBuilder',
      whitespacedResponse
    );
    const nullableString = await reqBuilder.callAsJson(nullable(boolean()));
    expect(nullableString.result).toEqual(null);

    const optionalString = await reqBuilder.callAsJson(optional(boolean()));
    expect(optionalString.result).toEqual(undefined);
  });
  it('should test response with no content object cases', async () => {
    const reqBuilder = defaultRequestBuilder(
      '/test/requestBuilder',
      noContentResponse
    );
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
    const reqBuilder = defaultRequestBuilder(
      '/test/requestBuilder',
      whitespacedResponse
    );
    const nullableString = await reqBuilder.callAsJson(
      nullable(employeeSchema)
    );
    expect(nullableString.result).toEqual(null);

    const optionalString = await reqBuilder.callAsJson(
      optional(employeeSchema)
    );
    expect(optionalString.result).toEqual(undefined);
  });
  it('should test request builder configured with all kind of headers', async () => {
    const reqBuilder = defaultRequestBuilder();
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
});

describe('test default request builder behavior with error responses', () => {
  async function verifyErrorMessage(
    runner: (req: RequestBuilder<string, boolean>) => Promise<any>,
    expectedErrorMessage: string,
    route?: string
  ) {
    try {
      const reqBuilder = defaultRequestBuilder(route);
      reqBuilder.defaultToError(ApiError);
      reqBuilder.validateResponse(false);
      await runner(reqBuilder);
      fail();
    } catch (error) {
      expect(error.message.startsWith(expectedErrorMessage)).toBeTruthy();
    }
  }

  it('should test request builder error factory with incorrect text response body', async () => {
    await verifyErrorMessage(
      (req) => {
        req.text('testBody');
        return req.callAsText();
      },
      'Could not parse body as string.',
      '/test/requestBuilder/errorResponse'
    );
  });
  it('should test request builder error factory with response body being empty string', async () => {
    await verifyErrorMessage(
      (req) => req.callAsJson(employeeSchema),
      'Could not parse body as JSON. The response body is empty.',
      '/test/requestBuilder/errorResponse'
    );
  });
  it('should test request builder error factory with incorrect json response body', async () => {
    await verifyErrorMessage(
      (req) => {
        const employee: Employee = {
          department: 'IT',
        };
        const mapped = req.prepareArgs({
          model: [employee, employeeSchema],
        });

        req.formData({
          model: mapped.model,
        });
        return req.callAsJson(employeeSchema);
      },
      `Could not parse body as JSON.\n\nExpected 'r' instead of 'e'`,
      '/test/requestBuilder/errorResponse'
    );
  });
  it('should test request builder error factory with response body not a string', async () => {
    await verifyErrorMessage(
      (req) => {
        req.text('testBody');
        return req.callAsJson(employeeSchema);
      },
      'Could not parse body as JSON. The response body is not a string.',
      '/test/requestBuilder/errorResponse'
    );
  });
  it('should test request builder error factory with json response mapping to incorect schema', async () => {
    await verifyErrorMessage((req) => {
      const employee: Employee = {
        department: 'IT',
      };
      const mapped = req.prepareArgs({
        model: [employee, employeeSchema],
      });

      req.formData({
        model: mapped.model,
      });
      return req.callAsJson(bossSchema);
    }, 'The response did not match the response schema.');
  });
});

describe('test default request builder with prefix formats', () => {
  async function buildRequestWithArrayQuery(
    prefixFormat: ArrayPrefixFunction,
    expectedUrl: string
  ) {
    const reqBuilder = defaultRequestBuilder();
    reqBuilder.query('array', ['item1', 'item2'], prefixFormat);

    const apiResponse = await reqBuilder.callAsText();
    expect(apiResponse.request.url).toEqual(expectedUrl);
  }

  it('should test request builder query indexedPrefix parameters with number, string, bool and BigInt', async () => {
    const expectedRequestUrl =
      'https://apimatic.hopto.org:3000/test/requestBuilder?number=12345&string=string&bool=true&biginit=12345';

    const reqBuilder = defaultRequestBuilder();
    reqBuilder.query('number', 12345);
    reqBuilder.query('string', 'string');
    reqBuilder.query('bool', true);
    reqBuilder.query('biginit', BigInt(12345));

    const apiResponse = await reqBuilder.callAsText();
    expect(apiResponse.request.url).toEqual(expectedRequestUrl);
  });
  it('should test request builder query indexedPrefix parameters with array', async () => {
    buildRequestWithArrayQuery(
      indexedPrefix,
      'https://apimatic.hopto.org:3000/test/requestBuilder?array%5B0%5D=item1&array%5B1%5D=item2'
    );
  });
  it('should test request builder query unindexedPrefix parameters with array', async () => {
    buildRequestWithArrayQuery(
      unindexedPrefix,
      'https://apimatic.hopto.org:3000/test/requestBuilder?array%5B%5D=item1&array%5B%5D=item2'
    );
  });
  it('should test request builder query plainPrefix parameters with array', async () => {
    buildRequestWithArrayQuery(
      plainPrefix,
      'https://apimatic.hopto.org:3000/test/requestBuilder?array=item1&array=item2'
    );
  });
  it('should test request builder query tabPrefix parameters with array', async () => {
    buildRequestWithArrayQuery(
      tabPrefix,
      'https://apimatic.hopto.org:3000/test/requestBuilder?array=item1%09item2'
    );
  });
  it('should test request builder query commaPrefix parameters with array', async () => {
    buildRequestWithArrayQuery(
      commaPrefix,
      'https://apimatic.hopto.org:3000/test/requestBuilder?array=item1%2Citem2'
    );
  });
  it('should test request builder query pipePrefix parameters with array', async () => {
    buildRequestWithArrayQuery(
      pipePrefix,
      'https://apimatic.hopto.org:3000/test/requestBuilder?array=item1%7Citem2'
    );
  });
  it('should test request builder query parameters with complex object', async () => {
    const expectedRequestUrl =
      'https://apimatic.hopto.org:3000/test/requestBuilder?object%5Bkey1%5D=value1&object%5Bkey2%5D=value2&object%5Bkey3%5D%5Bsubkey%5D=12345&object%5Bkey4%5D%5B0%5D=item1&object%5Bkey4%5D%5B1%5D=item2';

    const reqBuilder = defaultRequestBuilder();
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
    const reqBuilder = defaultRequestBuilder();
    reqBuilder.query('array1', ['item1', 'item2'], indexedPrefix);

    const prefixFormats = (reqBuilder as any)._queryParamsPrefixFormat;
    expect(prefixFormats.array1).toBe(indexedPrefix);
  });
});

describe('test appendTemplatePath function', () => {
  it('should produce correct URL when using appendTemplatePath', async () => {
    const requestBuilder = defaultRequestBuilder(undefined);
    const mappedArgs = requestBuilder.prepareArgs({
      user: ['user1', optional(string())],
      number: [123, optional(number())],
      bool: [true, optional(boolean())],
      float: [3.14, optional(number())],
      big: [9007199254740991, optional(bigint())],
    });

    const templateArray = Object.assign(['data/', '/', '/', '/', '/']);
    requestBuilder.appendTemplatePath(
      templateArray,
      pathParam(mappedArgs.user, 'user'),
      pathParam(mappedArgs.number, 'number'),
      pathParam(mappedArgs.bool, 'boolean'),
      skipEncode(mappedArgs.float, 'float'),
      pathParam(mappedArgs.big, 'bigInt')
    );
    const responseFromAppendPath = await requestBuilder.callAsText();

    expect(responseFromAppendPath.request.url).toEqual(
      'https://apimatic.hopto.org:3000/data/user1/123/true/3.14/9007199254740991'
    );
  });

  it('should produce correct URL when using appendTemplatePath with array type', async () => {
    const requestBuilder = defaultRequestBuilder(undefined);
    const integers = [123, 456, 789];
    const mappedArgs = requestBuilder.prepareArgs({
      integers: [integers, array(number())],
    });

    const templateArray = Object.assign(['data/']);
    requestBuilder.appendTemplatePath(templateArray, mappedArgs.integers);
    const responseFromAppendPath = await requestBuilder.callAsText();

    expect(responseFromAppendPath.request.url).toEqual(
      'https://apimatic.hopto.org:3000/data/123/456/789'
    );
  });
});

describe('paginate tests', () => {
  function reverseHeadersIterable(
    req: RequestBuilder<string, boolean>
  ): PagedAsyncIterable<any, any> {
    const rawHeaders = req.toRequest().headers ?? {};
    const headers = Object.entries(rawHeaders);
    return {
      ...createAsyncIterable(headers),
      pages: createAsyncIterable(headers),
    };
  }

  function createAsyncIterable<T>(headers: any[]): AsyncIterable<T> {
    return {
      [Symbol.asyncIterator]() {
        return createAsyncIterator<T>(headers);
      },
    };
  }

  function createAsyncIterator<T>(headers: any[]): AsyncIterator<T> {
    return {
      async next(): Promise<IteratorResult<T>> {
        const isDone = headers.length === 0;
        return {
          value: headers.pop(),
          done: isDone,
        };
      },
    };
  }

  it('should iterate over request header params', async () => {
    const requestBuilder = defaultRequestBuilder();
    requestBuilder.headers({
      status: 'active',
      type: 'user',
    });

    const headersIterable = requestBuilder.paginate(reverseHeadersIterable);

    const values: any[] = [];
    for await (const header of headersIterable) {
      values.push(header);
    }
    expect(values).toStrictEqual([
      ['type', 'user'],
      ['status', 'active'],
    ]);
  });
});

describe('updateRequestByJsonPointer tests', () => {
  const testBody = {
    user: {
      name: 'John',
      age: 30,
      address: {
        city: 'New York',
      },
    },
  };

  async function extractRequestBody(
    request: RequestBuilder<any, any>
  ): Promise<string> {
    const body = (await request.callAsText()).request.body;
    if (body === undefined) {
      throw new Error('Body is undefined');
    }
    if (typeof body.content !== 'string') {
      fail();
    }
    return body.content;
  }

  it('should update request body object', async () => {
    const requestBuilder = defaultRequestBuilder();
    requestBuilder.json(testBody);

    const newRequestBuilder = requestBuilder.updateByJsonPointer(
      '$request.body#/user/address/city',
      () => 'Boston'
    );

    const result = await extractRequestBody(requestBuilder);
    const newResult = await extractRequestBody(newRequestBuilder);

    expect(JSON.parse(result).user.address.city).toBe('New York');
    expect(JSON.parse(newResult).user.address.city).toBe('Boston');
  });

  it('should add new field in request body object', async () => {
    const requestBuilder = defaultRequestBuilder();
    requestBuilder.json(testBody);

    const newRequestBuilder = requestBuilder.updateByJsonPointer(
      '$request.body#/user/address/house',
      () => 214
    );

    const result = await extractRequestBody(requestBuilder);
    const newResult = await extractRequestBody(newRequestBuilder);

    expect(JSON.parse(result).user.address.house).toBeUndefined();
    expect(JSON.parse(newResult).user.address.house).toBe(214);
  });

  it('should update request body array', async () => {
    const requestBuilder = defaultRequestBuilder();
    requestBuilder.json([1, 2, 3]);

    const newRequestBuilder = requestBuilder.updateByJsonPointer(
      '$request.body#/0',
      () => 5
    );

    const result = await extractRequestBody(requestBuilder);
    const newResult = await extractRequestBody(newRequestBuilder);

    expect(JSON.parse(result)).toStrictEqual([1, 2, 3]);
    expect(JSON.parse(newResult)).toStrictEqual([5, 2, 3]);
  });

  it('should add new field in request body array', async () => {
    const requestBuilder = defaultRequestBuilder();
    requestBuilder.json([1, 2, 3]);

    const newRequestBuilder = requestBuilder.updateByJsonPointer(
      '$request.body#/3',
      () => 4
    );

    const result = await extractRequestBody(requestBuilder);
    const newResult = await extractRequestBody(newRequestBuilder);

    expect(JSON.parse(result)).toStrictEqual([1, 2, 3]);
    expect(JSON.parse(newResult)).toStrictEqual([1, 2, 3, 4]);
  });

  it('should update request body plain', async () => {
    const requestBuilder = defaultRequestBuilder();
    requestBuilder.text('NewYork');

    const newRequestBuilder = requestBuilder.updateByJsonPointer(
      '$request.body',
      () => 'Boston'
    );

    const result = await extractRequestBody(requestBuilder);
    const newResult = await extractRequestBody(newRequestBuilder);

    expect(result).toBe('NewYork');
    expect(newResult).toBe('Boston');
  });

  it('should add new field as request body plain', async () => {
    const requestBuilder = defaultRequestBuilder();
    requestBuilder.text(undefined);

    const newRequestBuilder = requestBuilder.updateByJsonPointer(
      '$request.body',
      () => 'Boston'
    );

    const newResult = await extractRequestBody(newRequestBuilder);
    expect(newResult).toBe('Boston');
  });

  it('should not add new field as request body undefined', async () => {
    const requestBuilder = defaultRequestBuilder();

    const newRequestBuilder = requestBuilder.updateByJsonPointer(
      '$request.body#/new',
      () => fail()
    );
    expect(
      async () => await extractRequestBody(newRequestBuilder)
    ).rejects.toThrow('Body is undefined');
  });

  it('should not add new field as request body plain', async () => {
    const requestBuilder = defaultRequestBuilder();
    requestBuilder.text('NewYork');

    const newRequestBuilder = requestBuilder.updateByJsonPointer(
      '$request.body#/new',
      () => fail()
    );

    const result = await extractRequestBody(newRequestBuilder);
    expect(result).toBe('NewYork');
  });

  it('should update path parameters', async () => {
    const requestBuilder = defaultRequestBuilder(undefined);

    const templateArray = Object.assign(['data/', '/']);
    requestBuilder.appendTemplatePath(
      templateArray,
      pathParam('123', 'userId'),
      pathParam('456', 'postId')
    );

    const newRequestBuilder = requestBuilder.updateByJsonPointer(
      '$request.path#/userId',
      () => '789'
    );

    expect(requestBuilder.toRequest().url).toBe(
      'https://apimatic.hopto.org:3000/data/123/456'
    );
    expect(newRequestBuilder.toRequest().url).toBe(
      'https://apimatic.hopto.org:3000/data/789/456'
    );
  });

  it('should update query parameters', async () => {
    const requestBuilder = defaultRequestBuilder();
    requestBuilder.query({
      filter: {
        status: 'active',
        type: 'user',
      },
    });

    const newRequestBuilder = requestBuilder.updateByJsonPointer(
      '$request.query#/filter/status',
      () => 'inactive'
    );

    expect(requestBuilder.toRequest().url).toBe(
      'https://apimatic.hopto.org:3000/test/requestBuilder?filter%5Bstatus%5D=active&filter%5Btype%5D=user'
    );

    expect(newRequestBuilder.toRequest().url).toBe(
      'https://apimatic.hopto.org:3000/test/requestBuilder?filter%5Bstatus%5D=inactive&filter%5Btype%5D=user'
    );
  });

  it('should add new query parameters', async () => {
    const requestBuilder = defaultRequestBuilder();

    const newRequestBuilder = requestBuilder.updateByJsonPointer(
      '$request.query#/key',
      () => 'value'
    );

    expect(requestBuilder.toRequest().url).toBe(
      'https://apimatic.hopto.org:3000/test/requestBuilder'
    );
    expect(newRequestBuilder.toRequest().url).toBe(
      'https://apimatic.hopto.org:3000/test/requestBuilder?key=value'
    );
  });

  it('should update headers', async () => {
    const requestBuilder = defaultRequestBuilder();
    requestBuilder.headers({
      'x-api-key': 'old-key',
      'content-type': 'application/json',
    });

    const newRequestBuilder = requestBuilder.updateByJsonPointer(
      '$request.headers#/x-api-key',
      () => 'new-key'
    );

    expect(requestBuilder.toRequest().headers?.['x-api-key']).toBe('old-key');
    expect(newRequestBuilder.toRequest().headers?.['x-api-key']).toBe(
      'new-key'
    );
  });

  it('should not update body when not set', async () => {
    const requestBuilder = defaultRequestBuilder();

    requestBuilder.updateByJsonPointer('$request.body#/user', () => fail());
  });

  it('should not update for null json pointer', async () => {
    const requestBuilder = defaultRequestBuilder();

    requestBuilder.updateByJsonPointer(null, () => fail());
  });

  it('should not update for invalid pointer prefix', async () => {
    const requestBuilder = defaultRequestBuilder();

    requestBuilder.updateByJsonPointer('$invalid.prefix#/key', () => fail());
  });
});

describe('test default request builder throwing errors', () => {
  const noneAuthenticationProvider = () => passThroughInterceptor;
  function mockHttpClientAdapterToTestRetries(): HttpClientInterface {
    return async (request, requestOptions) => {
      if (request.body?.type === 'text') {
        return {
          statusCode: 400,
          headers: {},
          body: '{"key": "value"}',
        } as HttpResponse;
      }
      const statusCode = requestOptions?.abortSignal?.aborted ? 400 : 500;
      throw new Error(
        `Time out error against http method ${request.method} and status code ${statusCode}`
      );
    };
  }
  const errorRequestBuilder = () =>
    defaultRequestBuilder(
      '/test/requestBuilder/errorResponse',
      undefined,
      noneAuthenticationProvider,
      mockHttpClientAdapterToTestRetries()
    );
  it('should test request builder with timeout', async () => {
    try {
      await errorRequestBuilder().callAsText();
    } catch (error) {
      expect(error.message).toEqual(
        'Time out error against http method GET and status code 500'
      );
    }
  });

  it('should test request builder throwOn with single status', async () => {
    try {
      const reqBuilder = errorRequestBuilder();
      reqBuilder.text('');
      reqBuilder.throwOn(
        400,
        ApiError,
        true,
        'Single status Error: {$statusCode}, accept => {$response.header.content-type}, body => {$response.body}.'
      );
      await reqBuilder.callAsText();
    } catch (error) {
      if (error instanceof ApiError) {
        expect(error.result).toBe(undefined);
        expect(error.statusCode).toEqual(400);
        expect(error.message).toEqual(
          'Single status Error: 400, accept => , body => {"key":"value"}.'
        );
        return;
      }
    }
    fail();
  });

  it('should test request builder throwOn with status range', async () => {
    try {
      const reqBuilder = errorRequestBuilder();
      reqBuilder.text('');
      reqBuilder.throwOn([399, 401], ApiError, false, 'Error with range');
      await reqBuilder.callAsText();
    } catch (error) {
      if (error instanceof ApiError) {
        expect(error.result).toBe(undefined);
        expect(error.statusCode).toEqual(400);
        expect(error.message).toEqual('Error with range');
        return;
      }
    }
    fail();
  });

  it('should test request builder throwOn with sub class of ApiError', async () => {
    try {
      const reqBuilder = errorRequestBuilder();
      reqBuilder.text('');
      reqBuilder.throwOn(400, ApiErrorChild, false, 'ApiError sub class');
      await reqBuilder.callAsText();
    } catch (error) {
      if (error instanceof ApiErrorChild) {
        expect(error.result).toEqual({ key: 'value' });
        expect(error.statusCode).toEqual(400);
        expect(error.message).toEqual('ApiError sub class');
        return;
      }
    }
    fail();
  });
});
