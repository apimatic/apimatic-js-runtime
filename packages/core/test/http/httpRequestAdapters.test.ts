import { convertExpressRequest } from '../../src/http/httpRequestAdapters';
import { HttpMethod } from '@apimatic/core-interfaces';

describe('convertExpressRequest', () => {
  const baseReq = {
    protocol: 'http',
    get: (key: string) => (key === 'host' ? 'localhost:3000' : undefined),
    originalUrl: '/api/test',
    headers: { 'x-custom': 'value', 'content-type': 'application/json' },
  };

  it('should convert a valid GET request', () => {
    const req = { ...baseReq, method: 'GET', body: undefined };
    const result = convertExpressRequest(req);
    expect(result.method).toBe('GET');
    expect(result.url).toBe('http://localhost:3000/api/test');
    expect(result.headers && result.headers['x-custom']).toBe('value');
    expect(result.body).toEqual({ type: 'text', content: '' });
  });

  it('should throw for invalid HTTP method', () => {
    const req = { ...baseReq, method: 'INVALID', body: undefined };
    expect(() => convertExpressRequest(req)).toThrow(
      'Invalid HTTP method: INVALID'
    );
  });

  it('should throw for invalid URL', () => {
    const req = {
      ...baseReq,
      method: 'GET',
      protocol: 'http',
      get: () => ':::::',
      originalUrl: ':::::',
      body: undefined,
    };
    expect(() => convertExpressRequest(req)).toThrow(/Invalid URL/);
  });

  it('should throw for missing hostname in URL', () => {
    const undefinedHostReq = {
      method: 'GET',
      protocol: 'http',
      get: (key: string) => (key === 'host' ? '' : 'localhost:3000'),
      originalUrl: '/api/test',
      headers: { 'x-custom': 'value', 'content-type': 'application/json' },
    };
    expect(() => convertExpressRequest(undefinedHostReq)).toThrow(
      /Missing host header/
    );
  });

  it('should throw for invalid protocol in URL', () => {
    const req = {
      ...baseReq,
      method: 'GET',
      protocol: 'invalidprotocol',
      get: (key: string) => (key === 'host' ? 'localhost:3000' : undefined),
      originalUrl: '/api/test',
      body: undefined,
    };
    expect(() => convertExpressRequest(req)).toThrow(/Invalid protocol/);
  });

  it('should throw for invalid headers (not object)', () => {
    const req = { ...baseReq, method: 'GET', headers: null, body: undefined };
    expect(() => convertExpressRequest(req)).toThrow(/Invalid headers/);
  });

  it('should throw for invalid headers (array)', () => {
    const req = { ...baseReq, method: 'GET', headers: [], body: undefined };
    expect(() => convertExpressRequest(req)).toThrow(/Invalid headers/);
  });

  it('should handle Buffer body', () => {
    const req = { ...baseReq, method: 'POST', body: Buffer.from('hello') };
    const result = convertExpressRequest(req);
    expect(result.body).toEqual({ type: 'text', content: 'hello' });
  });

  it('should handle string body', () => {
    const req = { ...baseReq, method: 'POST', body: 'string body' };
    const result = convertExpressRequest(req);
    expect(result.body).toEqual({ type: 'text', content: 'string body' });
  });

  it('should handle object body', () => {
    const req = { ...baseReq, method: 'POST', body: { foo: 'bar' } };
    const result = convertExpressRequest(req);
    expect(result.body).toEqual({
      type: 'text',
      content: JSON.stringify({ foo: 'bar' }),
    });
  });

  it('should handle number body', () => {
    const req = { ...baseReq, method: 'POST', body: 123 };
    const result = convertExpressRequest(req);
    expect(result.body).toEqual({ type: 'text', content: '123' });
  });

  it('should handle all valid HTTP methods', () => {
    const validMethods: HttpMethod[] = [
      'GET',
      'DELETE',
      'HEAD',
      'OPTIONS',
      'POST',
      'PUT',
      'PATCH',
      'LINK',
      'UNLINK',
    ];
    for (const method of validMethods) {
      const req = { ...baseReq, method, body: undefined };
      expect(convertExpressRequest(req).method).toBe(method);
    }
  });

  it('should throw if method is undefined', () => {
    const req = {
      protocol: 'http',
      get: (key: string) => (key === 'host' ? 'localhost:3000' : undefined),
      originalUrl: '/api/test',
      headers: { 'x-custom': 'value' },
      body: undefined,
    };
    expect(() => convertExpressRequest(req)).toThrow(
      'Invalid HTTP method: undefined'
    );
  });

  it('should handle headers with undefined and multiple values (array)', () => {
    const req = {
      protocol: 'http',
      get: (key: string) => (key === 'host' ? 'localhost:8080' : undefined),
      originalUrl: '/multi-header',
      method: 'GET',
      headers: {
        'x-multi': ['value1', 'value2'],
        'x-single': undefined,
        'content-type': 'application/json',
      },
      body: undefined,
    };
    const result = convertExpressRequest(req);

    expect(result.headers && result.headers['x-multi']).toBe('value1,value2');
    expect(result.headers && result.headers['content-type']).toBe(
      'application/json'
    );
    expect(result.headers && result.headers['x-single']).toBe('undefined');
  });

  it('should accept a valid URL and assign it correctly', () => {
    const req = {
      protocol: 'https',
      get: (key: string) => (key === 'host' ? 'example.com' : undefined),
      originalUrl: '/path?query=1',
      method: 'GET',
      headers: { accept: 'application/json' },
      body: undefined,
    };
    const result = convertExpressRequest(req);
    expect(result.url).toBe('https://example.com/path?query=1');
  });
});
