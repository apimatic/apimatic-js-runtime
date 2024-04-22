import {
  HttpRequest,
  HttpResponse,
  LoggingOptions,
  LogLevel,
} from '../../src/coreInterfaces';
import { ApiLogger } from '../../src/logger/apiLogger';
import { callHttpInterceptors } from '../../src/http/httpInterceptor';
import { NullLogger } from '../../src/logger/nullLogger';
import { mergeLoggingOptions } from '../../src/logger/defaultLoggingConfiguration';

let loggerSpy;
beforeEach(() => {
  // Reset the spy on console.log() before each test
  loggerSpy = jest.spyOn(console, 'log').mockImplementation();
});

afterEach(() => {
  // Restore the original implementation of console.log() after each test
  loggerSpy.mockRestore();
});

describe('Test APILogger with Request ConsoleLogging', () => {
  it('should only log req defaults', async () => {
    const loggingOpts = mergeLoggingOptions({});

    const expectedConsoleLogs = [
      'info: Request  HttpMethod: GET Url: https://apimatic.hopto.org:3000/test/requestBuilder ContentType: content-type',
    ];

    await mockClient(loggingOpts);
    expectLogsToBeLogged(loggerSpy, expectedConsoleLogs);
  });
  it('should override log req default level', async () => {
    const loggingOpts = mergeLoggingOptions({
      logLevel: LogLevel.Debug,
    });

    const expectedConsoleLogs = [
      'debug: Request  HttpMethod: GET Url: https://apimatic.hopto.org:3000/test/requestBuilder ContentType: content-type',
    ];

    await mockClient(loggingOpts);
    expectLogsToBeLogged(loggerSpy, expectedConsoleLogs);
  });
  it('should only log req defaults including query params', async () => {
    const loggingOpts = mergeLoggingOptions({
      logRequest: {
        includeQueryInPath: true,
      },
    });

    const expectedConsoleLogs = [
      'info: Request  HttpMethod: GET Url: https://apimatic.hopto.org:3000/test/requestBuilder?param1=test ContentType: content-type',
    ];

    await mockClient(loggingOpts);
    expectLogsToBeLogged(loggerSpy, expectedConsoleLogs);
  });
  it('should only log req body', async () => {
    const loggingOpts = mergeLoggingOptions({
      logRequest: {
        logBody: true,
      },
    });

    const expectedConsoleLogs = [
      'info: Request  HttpMethod: GET Url: https://apimatic.hopto.org:3000/test/requestBuilder ContentType: content-type',
      'info: Request Body: {"type":"text","content":"some req content"}',
    ];

    await mockClient(loggingOpts);
    expectLogsToBeLogged(loggerSpy, expectedConsoleLogs);
  });
  it('should only log req headers', async () => {
    const loggingOpts = mergeLoggingOptions({
      logRequest: {
        logHeaders: true,
      },
    });

    const expectedConsoleLogs = [
      'info: Request  HttpMethod: GET Url: https://apimatic.hopto.org:3000/test/requestBuilder ContentType: content-type',
      'info: Request Headers: {"Content-type":"content-type","Content-length":"Content-length","Authorization":"**Redacted**"}',
    ];

    await mockClient(loggingOpts);
    expectLogsToBeLogged(loggerSpy, expectedConsoleLogs);
  });

  it('should only log req headers in the include test', async () => {
    const loggingOpts = mergeLoggingOptions({
      logRequest: {
        logHeaders: true,
        headersToInclude: ['content-type'],
      },
    });

    const expectedConsoleLogs = [
      'info: Request  HttpMethod: GET Url: https://apimatic.hopto.org:3000/test/requestBuilder ContentType: content-type',
      'info: Request Headers: {"Content-type":"content-type"}',
    ];

    await mockClient(loggingOpts);
    expectLogsToBeLogged(loggerSpy, expectedConsoleLogs);
  });

  it('should only log all req headers except the excluded', async () => {
    const loggingOpts = mergeLoggingOptions({
      logRequest: {
        logHeaders: true,
        headersToExclude: ['content-type'],
      },
    });

    const expectedConsoleLogs = [
      'info: Request  HttpMethod: GET Url: https://apimatic.hopto.org:3000/test/requestBuilder ContentType: content-type',
      'info: Request Headers: {"Content-length":"Content-length","Authorization":"**Redacted**"}',
    ];

    await mockClient(loggingOpts);
    expectLogsToBeLogged(loggerSpy, expectedConsoleLogs);
  });

  it('should redact req senstive headers with enabled maskSensitiveHeaders', async () => {
    const loggingOpts = mergeLoggingOptions({
      logRequest: {
        logHeaders: true,
        headersToWhiteList: ['authorization'],
      },
      maskSensitiveHeaders: true,
    });

    const expectedConsoleLogs = [
      'info: Request  HttpMethod: GET Url: https://apimatic.hopto.org:3000/test/requestBuilder ContentType: content-type',
      'info: Request Headers: {"Content-type":"content-type","Content-length":"Content-length","Authorization":"Bearer EAAAEFZ2r-rqsEBBB0s2rh210e18mspf4dzga"}',
    ];

    await mockClient(loggingOpts);
    expectLogsToBeLogged(loggerSpy, expectedConsoleLogs);
  });

  it('should not log req senstive headers as redacted with disabled maskSensitiveHeaders', async () => {
    const loggingOpts = mergeLoggingOptions({
      logRequest: {
        logHeaders: true,
        headersToWhiteList: ['authorization'],
      },
      maskSensitiveHeaders: false,
    });

    const expectedConsoleLogs = [
      'info: Request  HttpMethod: GET Url: https://apimatic.hopto.org:3000/test/requestBuilder ContentType: content-type',
      'info: Request Headers: {"Content-type":"content-type","Content-length":"Content-length","Authorization":"Bearer EAAAEFZ2r-rqsEBBB0s2rh210e18mspf4dzga"}',
    ];

    await mockClient(loggingOpts);
    expectLogsToBeLogged(loggerSpy, expectedConsoleLogs);
  });
});

describe('Test APILogger with Response ConsoleLogging', () => {
  it('should only log resp defaults', async () => {
    const loggingOpts = mergeLoggingOptions({});

    const expectedConsoleLogs = [
      'value should not matter',
      'info: Response HttpStatusCode: 200 Length: Content-length ContentType: content-type',
    ];

    await mockClient(loggingOpts);
    expectLogsToBeLogged(loggerSpy, expectedConsoleLogs, 1);
  });
  it('should override log resp default level', async () => {
    const loggingOpts = mergeLoggingOptions({
      logLevel: LogLevel.Debug,
    });

    const expectedConsoleLogs = [
      'ignore value',
      'debug: Response HttpStatusCode: 200 Length: Content-length ContentType: content-type',
    ];

    await mockClient(loggingOpts);
    expectLogsToBeLogged(loggerSpy, expectedConsoleLogs, 1);
  });
  it('should only log resp body', async () => {
    const loggingOpts = mergeLoggingOptions({
      logResponse: {
        logBody: true,
      },
    });

    const expectedConsoleLogs = [
      'ignore value',
      'info: Response HttpStatusCode: 200 Length: Content-length ContentType: content-type',
      'info: Response Body: testBody',
    ];

    await mockClient(loggingOpts);
    expectLogsToBeLogged(loggerSpy, expectedConsoleLogs, 1);
  });
  it('should only log resp headers', async () => {
    const loggingOpts = mergeLoggingOptions({
      logResponse: {
        logHeaders: true,
      },
    });

    const expectedConsoleLogs = [
      'ignore value',
      'info: Response HttpStatusCode: 200 Length: Content-length ContentType: content-type',
      'info: Response Headers: {"Set-Cookies":"**Redacted**","Content-length":"Content-length","Content-Type":"content-type"}',
    ];

    await mockClient(loggingOpts);
    expectLogsToBeLogged(loggerSpy, expectedConsoleLogs, 1);
  });

  it('should only log resp headers in the include test', async () => {
    const loggingOpts = mergeLoggingOptions({
      logResponse: {
        logHeaders: true,
        headersToInclude: ['content-type'],
      },
    });

    const expectedConsoleLogs = [
      'ignore value',
      'info: Response HttpStatusCode: 200 Length: Content-length ContentType: content-type',
      'info: Response Headers: {"Content-Type":"content-type"}',
    ];

    await mockClient(loggingOpts);
    expectLogsToBeLogged(loggerSpy, expectedConsoleLogs, 1);
  });

  it('should only log all resp headers except the excluded', async () => {
    const loggingOpts = mergeLoggingOptions({
      logResponse: {
        logHeaders: true,
        headersToExclude: ['content-type'],
      },
    });

    const expectedConsoleLogs = [
      'ignore value',
      'info: Response HttpStatusCode: 200 Length: Content-length ContentType: content-type',
      'info: Response Headers: {"Set-Cookies":"**Redacted**","Content-length":"Content-length"}',
    ];

    await mockClient(loggingOpts);
    expectLogsToBeLogged(loggerSpy, expectedConsoleLogs, 1);
  });

  it('should redact resp senstive headers to log with enabled maskSensitiveHeaders', async () => {
    const loggingOpts = mergeLoggingOptions({
      logResponse: {
        logHeaders: true,
        headersToWhiteList: ['Set-Cookies'],
      },
      maskSensitiveHeaders: true,
    });

    const expectedConsoleLogs = [
      'ignore value',
      'info: Response HttpStatusCode: 200 Length: Content-length ContentType: content-type',
      'info: Response Headers: {"Set-Cookies":"some value","Content-length":"Content-length","Content-Type":"content-type"}',
    ];

    await mockClient(loggingOpts);
    expectLogsToBeLogged(loggerSpy, expectedConsoleLogs, 1);
  });

  it('should allow resp senstive headers to log with disabled maskSensitiveHeaders', async () => {
    const loggingOpts = mergeLoggingOptions({
      logResponse: {
        logHeaders: true,
        headersToWhiteList: ['Set-Cookies'],
      },
      maskSensitiveHeaders: false,
    });

    const expectedConsoleLogs = [
      'ignore value',
      'info: Response HttpStatusCode: 200 Length: Content-length ContentType: content-type',
      'info: Response Headers: {"Set-Cookies":"some value","Content-length":"Content-length","Content-Type":"content-type"}',
    ];

    await mockClient(loggingOpts);
    expectLogsToBeLogged(loggerSpy, expectedConsoleLogs, 1);
  });
});

describe('APILogger with NullLogging', () => {
  it('should not log anything', async () => {
    const loggingOpts = mergeLoggingOptions({
      logger: new NullLogger(),
    });
    await mockClient(loggingOpts);
    expect(loggerSpy).not.toHaveBeenCalled();
  });
});

function mockInterceptor(loggingOpt: LoggingOptions) {
  const apiLogger = new ApiLogger(loggingOpt);
  return async (req, options, next) => {
    apiLogger.logRequest(req);
    const context = await next(req, options);
    apiLogger.logResponse(context.response);
    return { request: req, response: context.response };
  };
}

function mockRequest(): HttpRequest {
  return {
    method: 'GET',
    url: 'https://apimatic.hopto.org:3000/test/requestBuilder?param1=test',
    headers: {
      'Content-type': 'content-type',
      'Content-length': 'Content-length',
      Authorization: 'Bearer EAAAEFZ2r-rqsEBBB0s2rh210e18mspf4dzga',
    },
    body: {
      type: 'text',
      content: 'some req content',
    },
  };
}

function mockResponse(): HttpResponse {
  return {
    statusCode: 200,
    body: 'testBody',
    headers: {
      'Set-Cookies': 'some value',
      'Content-length': 'Content-length',
      'Content-Type': 'content-type',
    },
  };
}

async function mockClient(loggingOpts: LoggingOptions) {
  const client = async (req) => {
    return { request: req, response: mockResponse() };
  };
  const executor = callHttpInterceptors([mockInterceptor(loggingOpts)], client);
  return await executor(mockRequest(), undefined);
}

function expectLogsToBeLogged(logSpy, expectedConsoleLogs, index = 0) {
  for (let i = index; i < expectedConsoleLogs.length; i++) {
    expect(logSpy.mock.calls[i][0]).toEqual(expectedConsoleLogs[i]);
  }
}
