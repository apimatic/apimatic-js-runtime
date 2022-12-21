import {
  callHttpInterceptors,
  HttpCallExecutor,
  passThroughInterceptor,
} from '../../src/http/httpInterceptor';
import {
  HttpContext,
  HttpRequest,
  HttpResponse,
} from '../../src/coreInterfaces';
import { AbortError } from '../../src/errors/abortError';
import { RequestOptions } from '../../lib/http/requestBuilder';

it('calls http interceptor chain', async () => {
  const intercept = (req, opt, next: HttpCallExecutor<RequestOptions>) =>
    next(req, opt);
  const interceptors = [intercept];
  const client = async (req: HttpRequest, opt: RequestOptions) => {
    if (opt?.abortSignal) {
      if (opt.abortSignal.aborted) {
        throw new AbortError();
      }
    }
    return {
      request: mockRequest(req),
      response: mockResponse(),
    } as HttpContext;
  };

  const interceptor = callHttpInterceptors(interceptors, client);
  const result = await interceptor(mockRequest(), mockRequestOptions());
  expect(result).toHaveProperty('request', mockRequest());
  expect(result).toHaveProperty('response', mockResponse());
});

it('calls pass through interceptor', async () => {
  const client = async (req, opt) => {
    if (opt?.abortSignal) {
      if (opt.abortSignal.aborted) {
        throw new AbortError();
      }
    }
    return {
      request: mockRequest(req),
      response: mockResponse(),
    } as HttpContext;
  };
  const context = await passThroughInterceptor(
    mockRequest(),
    mockRequestOptions(),
    client
  );
  expect(context).toHaveProperty('request', mockRequest());
});

function mockRequest(req?: HttpRequest) {
  return {
    ...req,
    method: 'GET',
    url: 'url',
    headers: { 'test-header': 'test-value' },
    body: {
      content: 'testBody',
      type: 'text',
    },
    responseType: 'text',
    auth: { username: 'test-username', password: 'test-password' },
  } as HttpRequest;
}

function mockResponse() {
  return {
    statusCode: 200,
    body: 'testBody result',
    headers: { 'test-header': 'test-value' },
  } as HttpResponse;
}

function mockRequestOptions() {
  return {
    abortSignal: { aborted: false },
  } as RequestOptions;
}
