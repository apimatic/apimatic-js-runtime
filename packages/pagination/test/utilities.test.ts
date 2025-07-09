import { ApiResponse } from '../src/coreInterfaces';
import {
  cloneRequest,
  Request,
  updateRequestByJsonPointer,
} from '../src/request';
import { getValueByJsonPointer } from '../src/utilities';

describe('getResponseValueByJsonPointer tests', () => {
  const requestBody = {
    user: {
      name: 'Alice',
      age: 25,
      address: {
        city: 'Islamabad',
      },
    },
  };
  const mockResponse: ApiResponse<any> = {
    request: {} as any,
    statusCode: 200,
    headers: {
      'content-type': 'application/json',
      'x-request-id': 'abc-123',
    },
    result: {},
    body: JSON.stringify(requestBody),
  };

  test.each([
    [
      'should extract a nested value from body',
      '$response.body#/user/address/city',
      'Islamabad',
    ],
    [
      'should extract a value from headers',
      '$response.headers#/content-type',
      'application/json',
    ],
    [
      'should return null for non-existing path in body',
      '$response.body#/user/phone',
      null,
    ],
    [
      'should return null when jsonPath of pointer is empty',
      '$response.body#',
      requestBody,
    ],
    ['should return null when pointer is empty', '', null],
    ['should return null for unsupported prefix', '$invalid#/user/name', null],
    [
      'should extract a top-level value from body',
      '$response.body#/user/name',
      'Alice',
    ],
  ])('%s', (_: string, jsonPointer: string, expectedResult: any) => {
    const value = getValueByJsonPointer(mockResponse, jsonPointer);
    expect(value).toStrictEqual(expectedResult);
  });

  it('should return null for malformed JSON string in body', () => {
    const brokenJsonResponse: ApiResponse<any> = {
      ...mockResponse,
      body: '{bad json}',
    };
    const value = getValueByJsonPointer(
      brokenJsonResponse,
      '$response.body#/user/name'
    );
    expect(value).toBeNull();
  });

  it('should return null for non-string body (e.g. Blob)', () => {
    const blobResponse: ApiResponse<any> = {
      ...mockResponse,
      body: new Blob(['some text'], { type: 'text/plain' }),
    };
    const value = getValueByJsonPointer(
      blobResponse,
      '$response.body#/user/name'
    );
    expect(value).toBeNull();
  });

  it('should return null for non-string body (e.g. ReadableStream)', () => {
    const streamResponse: ApiResponse<any> = {
      ...mockResponse,
      body: {} as NodeJS.ReadableStream,
    };
    const value = getValueByJsonPointer(
      streamResponse,
      '$response.body#/user/name'
    );
    expect(value).toBeNull();
  });
});

describe('updateRequestByJsonPointer tests', () => {
  function defaultRequest(): Request {
    return {
      headerParams: {},
      queryParams: {},
      pathParams: {},
      body: {
        user: {
          name: 'John',
          age: 30,
          address: {
            city: 'New York',
          },
        },
      },
    };
  }

  it('should update request body object', async () => {
    const request = defaultRequest();
    const clone = cloneRequest(request);

    updateRequestByJsonPointer(
      request,
      '$request.body#/user/address/city',
      () => 'Boston'
    );

    expect(clone.body.user.address.city).toBe('New York');
    expect(request.body.user.address.city).toBe('Boston');
  });

  it('should add new field in request body object', async () => {
    const request = defaultRequest();
    const clone = cloneRequest(request);

    updateRequestByJsonPointer(
      request,
      '$request.body#/user/address/house',
      () => 214
    );

    expect(clone.body.user.address.house).toBeUndefined();
    expect(request.body.user.address.house).toBe(214);
  });

  it('should update request body array', async () => {
    const request = defaultRequest();
    request.body = [1, 2, 3];
    const clone = cloneRequest(request);

    updateRequestByJsonPointer(request, '$request.body#/0', () => 5);

    expect(clone.body).toStrictEqual([1, 2, 3]);
    expect(request.body).toStrictEqual([5, 2, 3]);
  });

  it('should add new field in request body object', async () => {
    const request = defaultRequest();
    request.body = [1, 2, 3];
    const clone = cloneRequest(request);

    updateRequestByJsonPointer(request, '$request.body#/3', () => 4);

    expect(clone.body).toStrictEqual([1, 2, 3]);
    expect(request.body).toStrictEqual([1, 2, 3, 4]);
  });

  it('should update request body plain', async () => {
    const request = defaultRequest();
    request.body = 'NewYork';
    const clone = cloneRequest(request);

    updateRequestByJsonPointer(request, '$request.body', () => 'Boston');

    expect(clone.body).toBe('NewYork');
    expect(request.body).toBe('Boston');
  });

  it('should not add new field as request body plain', async () => {
    const request = defaultRequest();
    request.body = undefined;

    updateRequestByJsonPointer(request, '$request.body', () => fail());
  });

  it('should update path parameters', async () => {
    const request = defaultRequest();

    request.pathParams = {
      userId: '123',
      postId: '456',
    };

    updateRequestByJsonPointer(request, '$request.path#/userId', () => '789');

    expect(request.pathParams.userId).toBe('789');
  });

  it('should update query parameters', async () => {
    const request = defaultRequest();

    request.queryParams = {
      filter: {
        status: 'active',
        type: 'user',
      },
    };

    updateRequestByJsonPointer(
      request,
      '$request.query#/filter/status',
      () => 'inactive'
    );

    expect(request.queryParams.filter).toStrictEqual({
      status: 'inactive',
      type: 'user',
    });
  });

  it('should add new query parameters', async () => {
    const request = defaultRequest();

    updateRequestByJsonPointer(request, '$request.query#/key', () => 'value');
    expect(request.queryParams.key).toBe('value');
  });

  it('should update headers', async () => {
    const request = defaultRequest();
    request.headerParams = {
      'x-api-key': 'old-key',
      'content-type': 'application/json',
    };
    const cloned = cloneRequest(request);

    updateRequestByJsonPointer(
      request,
      '$request.headers#/x-api-key',
      () => 'new-key'
    );

    expect(cloned.headerParams['x-api-key']).toBe('old-key');
    expect(request.headerParams['x-api-key']).toBe('new-key');
  });

  it('should not update body when not set', async () => {
    const request = defaultRequest();
    request.body = undefined;

    updateRequestByJsonPointer(request, '$request.body#/user', () => fail());
  });

  it('should not update for null json pointer', async () => {
    const request = defaultRequest();

    updateRequestByJsonPointer(request, null, () => fail());
  });

  it('should not update for invalid pointer prefix', async () => {
    const request = defaultRequest();

    updateRequestByJsonPointer(request, '$invalid.prefix#/key', () => fail());
  });
});
