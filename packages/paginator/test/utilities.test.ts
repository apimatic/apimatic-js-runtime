import { ApiResponse } from '@apimatic/core-interfaces';
import { getValueByJsonPointer } from '../src/Utilities/utilities';

describe('getValueByJsonPointer tests', () => {
  const mockBody = JSON.stringify({
    user: {
      name: 'Alice',
      age: 25,
      address: {
        city: 'Islamabad',
      },
    },
  });

  const mockResponse: ApiResponse<any> = {
    request: {} as any,
    statusCode: 200,
    headers: {
      'content-type': 'application/json',
      'x-request-id': 'abc-123',
    },
    result: {},
    body: mockBody,
  };

  it('should extract a top-level value from body', () => {
    const value = getValueByJsonPointer(
      mockResponse,
      '$response.body#/user/name'
    );
    expect(value).toBe('Alice');
  });

  it('should extract a nested value from body', () => {
    const value = getValueByJsonPointer(
      mockResponse,
      '$response.body#/user/address/city'
    );
    expect(value).toBe('Islamabad');
  });

  it('should extract a value from headers', () => {
    const value = getValueByJsonPointer(
      mockResponse,
      '$response.headers#/content-type'
    );
    expect(value).toBe('application/json');
  });

  it('should return null for non-existing path in body', () => {
    const value = getValueByJsonPointer(
      mockResponse,
      '$response.body#/user/phone'
    );
    expect(value).toBeNull();
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

  it('should return null when jsonPath of pointer is empty', () => {
    const value = getValueByJsonPointer(mockResponse, '$response.body#');
    expect(value).toBeNull();
  });

  it('should return null when pointer is empty', () => {
    const value = getValueByJsonPointer(mockResponse, '');
    expect(value).toBeNull();
  });

  it('should return null for unsupported prefix', () => {
    const value = getValueByJsonPointer(
      mockResponse,
      '$request.body#/user/name'
    );
    expect(value).toBeNull();
  });
});
