import { ApiResponse } from '../src/coreInterfaces';
import { getValueByJsonPointer } from '../src/utilities';

describe('getValueByJsonPointer tests', () => {
  const mockResponse: ApiResponse<any> = {
    request: {} as any,
    statusCode: 200,
    headers: {
      'content-type': 'application/json',
      'x-request-id': 'abc-123',
    },
    result: {},
    body: JSON.stringify({
      user: {
        name: 'Alice',
        age: 25,
        address: {
          city: 'Islamabad',
        },
      },
    }),
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
      null,
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
    expect(value).toBe(expectedResult);
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
