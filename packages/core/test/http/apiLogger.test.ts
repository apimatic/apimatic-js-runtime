import {
  HttpRequest,
  HttpResponse,
  Level,
  LoggingOptions,
} from '../../src/coreInterfaces';
import { ConsoleLogger } from '../../src/logger/defaultLogger';
import { ApiLogger } from '../../src/logger/apiLogger';
import { callHttpInterceptors } from '../../src/http/httpInterceptor';
import { NullLogger } from '../../src/logger/nullLogger';

let loggerSpy;
beforeEach(() => {
  // Reset the spy on console.log() before each test
  loggerSpy = jest.spyOn(console, 'log').mockImplementation();
});

afterEach(() => {
  // Restore the original implementation of console.log() after each test
  loggerSpy.mockRestore();
});

describe('APILogger with ConsoleLogging', () => {
  it('should log req and response body, headers with include header filters', async () => {
    const loggingOpts: LoggingOptions = {
      logger: new ConsoleLogger(),
      logLevel: Level.Debug,
      logRequest: {
        logBody: true,
        logHeaders: true,
        includeQueryInPath: true,
        headerToInclude: ['Content-type'],
        headerToExclude: ['Authorization'],
      },
      logResponse: {
        logBody: true,
        logHeaders: true,
        headerToInclude: ['Content-length'],
        headerToExclude: ['test-header'],
      },
    };

    const expectedConsoleLogs = [
      'debug: Request  HttpMethod: GET Url: https://apimatic.hopto.org:3000/test/requestBuilder?param1=test ContentType: content-type',
      'debug: Request Headers {"Content-type":"content-type"}',
      'debug: Request Body {"type":"text","content":"some req content"}',
      'debug: Response HttpStatusCode 200 Length Content-length ContentType content-type',
      'debug: Response Headers {"Content-length":"Content-length"}',
      'debug: Response Body "testBody"',
    ];

    await mockClient(loggingOpts);
    expectLogsToBeLogged(loggerSpy, expectedConsoleLogs);
  });

  it('should not log req and response body, headers ', async () => {
    const loggingOpts: LoggingOptions = {
      logger: new ConsoleLogger(),
      logRequest: {
        logBody: false,
        logHeaders: false,
        includeQueryInPath: false,
        headerToInclude: [],
        headerToExclude: [],
      },
      logResponse: {
        logBody: false,
        logHeaders: false,
        headerToInclude: [],
        headerToExclude: [],
      },
    };

    const expectedConsoleLogs = [
      'info: Request  HttpMethod: GET Url: https://apimatic.hopto.org:3000/test/requestBuilder ContentType: content-type',
      'info: Response HttpStatusCode 200 Length Content-length ContentType content-type',
    ];

    await mockClient(loggingOpts);
    expectLogsToBeLogged(loggerSpy, expectedConsoleLogs);
  });

  it('should log req and response headers with exclude header filters', async () => {
    const loggingOpts: LoggingOptions = {
      logger: new ConsoleLogger(),
      logRequest: {
        logHeaders: true,
        headerToInclude: [],
        headerToExclude: ['Authorization'],
      },
      logResponse: {
        logHeaders: true,
        headerToInclude: [],
        headerToExclude: ['test-header'],
      },
    };

    const expectedConsoleLogs = [
      'info: Request  HttpMethod: GET Url: https://apimatic.hopto.org:3000/test/requestBuilder ContentType: content-type',
      'info: Request Headers {"Content-type":"content-type","Content-length":"Content-length"}',
      'info: Response HttpStatusCode 200 Length Content-length ContentType content-type',
      'info: Response Headers {"test-header1":"test-value1","Content-type":"content-type","Content-length":"Content-length"}',
    ];

    await mockClient(loggingOpts);
    expectLogsToBeLogged(loggerSpy, expectedConsoleLogs);
  });
});

describe('APILogger with NullLogging', () => {
  it('should not log anything', async () => {
    const loggingOpts: LoggingOptions = {
      logger: new NullLogger(),
    };
    await mockClient(loggingOpts);
    expect(loggerSpy).not.toHaveBeenCalled();
  });
});

describe('APILogger with no logger options', () => {
  it('should not log anything', async () => {
    await mockClient();
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
      Authorization: "'Bearer EAAAEFZ2r-rqsEBBB0s2rh210e18mspf4dzga'",
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
      'test-header': 'test-value',
      'test-header1': 'test-value1',
      'Content-type': 'content-type',
      'Content-length': 'Content-length',
    },
  };
}

async function mockClient(loggingOpts: LoggingOptions = {}) {
  const client = async (req) => {
    return { request: req, response: mockResponse() };
  };
  const executor = callHttpInterceptors([mockInterceptor(loggingOpts)], client);
  return await executor(mockRequest(), undefined);
}

function expectLogsToBeLogged(logSpy, expectedConsoleLogs) {
  for (let i = 0; i < expectedConsoleLogs.length; i++) {
    expect(logSpy.mock.calls[i][0]).toEqual(expectedConsoleLogs[i]);
  }
}
