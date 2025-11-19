jest.mock('formidable', () => ({}));
import { convertExpressRequest } from '../../../src/http/requestAdapters/expressRequestAdapter';
import { HttpMethod } from '@apimatic/core-interfaces';
import express, { Request } from 'express';
import supertest from 'supertest';

describe('convertExpressRequest', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(express.text());
    app.use(express.raw());

    // Helper route that converts the request and returns the result
    app.use('/test', (req: Request, res) => {
      try {
        const result = convertExpressRequest(req);
        res.status(200).json(result);
      } catch (err: any) {
        res.status(400).json({ error: err.message });
      }
    });
  });

  it('should convert a valid GET request', async () => {
    const response = await supertest(app)
      .get('/test/api/test')
      .set('Host', 'localhost:3000')
      .set('x-custom', 'value')
      .set('content-type', 'text/plain');

    expect(response.status).toBe(200);
    expect(response.body.method).toBe('GET');
    expect(response.body.url).toBe('http://localhost:3000/test/api/test');
    expect(response.body.headers['x-custom']).toBe('value');
    expect(response.body.body).toEqual({ type: 'text', content: '' });
  });

  it('should throw for missing hostname in URL', async () => {
    const mockReq = {
      method: 'GET',
      protocol: 'http',
      get: (key: string) => (key === 'host' ? '' : 'localhost:3000'),
      originalUrl: '/api/test',
      headers: { 'x-custom': 'value', 'content-type': 'application/json' },
    };

    expect(() => convertExpressRequest(mockReq as any)).toThrow(
      /Missing host header/
    );
  });

  it('should throw for invalid protocol in URL', async () => {
    const mockReq = {
      method: 'GET',
      protocol: 'invalidprotocol',
      get: (key: string) => (key === 'host' ? 'localhost:3000' : undefined),
      originalUrl: '/api/test',
      body: undefined,
      headers: { 'x-custom': 'value', 'content-type': 'application/json' },
    };

    expect(() => convertExpressRequest(mockReq as any)).toThrow(/Invalid URL/);
  });

  it('should throw for invalid headers', async () => {
    const mockReq = {
      method: 'GET',
      protocol: 'http',
      get: (key: string) => (key === 'host' ? 'localhost:3000' : undefined),
      originalUrl: '/api/test',
      headers: null,
      body: undefined,
    };

    expect(() => convertExpressRequest(mockReq as any)).toThrow(
      /Invalid headers/
    );
  });

  it('should throw for invalid headers (array)', async () => {
    const mockReq = {
      method: 'GET',
      protocol: 'http',
      get: (key: string) => (key === 'host' ? 'localhost:3000' : undefined),
      originalUrl: '/api/test',
      headers: [],
      body: undefined,
    };

    expect(() => convertExpressRequest(mockReq as any)).toThrow(
      /Invalid headers/
    );
  });

  it('should handle Buffer body', async () => {
    const response = await supertest(app)
      .post('/test/api/test')
      .set('Host', 'localhost:3000')
      .set('Content-Type', 'application/octet-stream')
      .send(Buffer.from('hello'));

    expect(response.status).toBe(200);
    expect(response.body.body).toEqual({ type: 'text', content: 'hello' });
  });

  it('should handle string body', async () => {
    const response = await supertest(app)
      .post('/test/api/test')
      .set('Host', 'localhost:3000')
      .set('Content-Type', 'text/plain')
      .send('string body');

    expect(response.status).toBe(200);
    expect(response.body.body).toEqual({
      type: 'text',
      content: 'string body',
    });
  });

  it('should handle object body', async () => {
    const response = await supertest(app)
      .post('/test/api/test')
      .set('Host', 'localhost:3000')
      .send({ foo: 'bar' });

    expect(response.status).toBe(200);
    expect(response.body.body).toEqual({
      type: 'text',
      content: JSON.stringify({ foo: 'bar' }),
    });
  });

  it('should handle number body', async () => {
    const mockReq = {
      method: 'POST',
      protocol: 'http',
      get: (key: string) => (key === 'host' ? 'localhost:3000' : undefined),
      originalUrl: '/api/test',
      headers: { 'x-custom': 'value', 'content-type': 'application/json' },
      body: 123,
    };

    const result = convertExpressRequest(mockReq as any);
    expect(result.body).toEqual({ type: 'text', content: '123' });
  });

  it('should handle boolean body', async () => {
    const mockReq = {
      method: 'POST',
      protocol: 'http',
      get: (key: string) => (key === 'host' ? 'localhost:3000' : undefined),
      originalUrl: '/api/test',
      headers: { 'x-custom': 'value', 'content-type': 'application/json' },
      body: true,
    };

    const result = convertExpressRequest(mockReq as any);
    expect(result.body).toEqual({ type: 'text', content: 'true' });
  });

  it('should handle null body', async () => {
    const response = await supertest(app)
      .post('/test/api/test')
      .unset('Content-Type')
      .set('Host', 'localhost:3000');

    expect(response.status).toBe(200);
    expect(response.body.body).toEqual({ type: 'text', content: '' });
  });

  it('should handle symbol body', async () => {
    const mockReq = {
      method: 'POST',
      protocol: 'http',
      get: (key: string) => (key === 'host' ? 'localhost:3000' : undefined),
      originalUrl: '/api/test',
      headers: { 'x-custom': 'value', 'content-type': 'application/json' },
      body: Symbol('test'),
    };

    const result = convertExpressRequest(mockReq as any);
    expect(result.body).toEqual({ type: 'text', content: 'Symbol(test)' });
  });

  it('should handle function body', async () => {
    const func = () => {
      return 'test';
    };
    const mockReq = {
      method: 'POST',
      protocol: 'http',
      get: (key: string) => (key === 'host' ? 'localhost:3000' : undefined),
      originalUrl: '/api/test',
      headers: { 'x-custom': 'value', 'content-type': 'application/json' },
      body: func,
    };

    const result = convertExpressRequest(mockReq as any);
    expect(result.body).toEqual({ type: 'text', content: func.toString() });
  });

  it('should handle array body with string and BigInt', async () => {
    const arr = ['john', BigInt(9532532599932)];
    const mockReq = {
      method: 'POST',
      protocol: 'http',
      get: (key: string) => (key === 'host' ? 'localhost:3000' : undefined),
      originalUrl: '/api/test',
      headers: { 'x-custom': 'value', 'content-type': 'application/json' },
      body: arr,
    };

    const result = convertExpressRequest(mockReq as any);
    expect(result.body).toEqual({
      type: 'text',
      content: '["john",9532532599932]',
    });
  });

  it('should handle object body with BigInt', async () => {
    const obj = { name: 'john', value: BigInt('1234567891298373746474783') };
    const mockReq = {
      method: 'POST',
      protocol: 'http',
      get: (key: string) => (key === 'host' ? 'localhost:3000' : undefined),
      originalUrl: '/api/test',
      headers: { 'x-custom': 'value', 'content-type': 'application/json' },
      body: obj,
    };

    const result = convertExpressRequest(mockReq as any);
    expect(result.body).toEqual({
      type: 'text',
      content: '{"name":"john","value":1234567891298373746474783}',
    });
  });

  it('should handle all valid HTTP methods', async () => {
    const validMethods: HttpMethod[] = [
      'GET',
      'DELETE',
      'OPTIONS',
      'POST',
      'HEAD',
      'PUT',
      'PATCH',
      'LINK',
      'UNLINK',
    ];

    for (const method of validMethods) {
      const response = await supertest(app)
        [method.toLowerCase() as 'get']('/test/api/test')
        .set('Host', 'localhost:3000');

      expect(response.status).toBe(200);
      if (method !== 'HEAD') {
        // HEAD responses have no body
        expect(response.body.method).toBe(method);
      }
    }
  });

  it('should throw if method is undefined', async () => {
    const mockReq = {
      protocol: 'http',
      get: (key: string) => (key === 'host' ? 'localhost:3000' : undefined),
      originalUrl: '/api/test',
      headers: { 'x-custom': 'value' },
      body: undefined,
      method: undefined,
    };

    expect(() => convertExpressRequest(mockReq as any)).toThrow(
      'Unsupported HTTP method: undefined'
    );
  });

  it('should handle headers with undefined and multiple values (array)', async () => {
    const mockReq = {
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

    const result = convertExpressRequest(mockReq as any);
    expect(result.headers && result.headers['x-multi']).toBe('value1,value2');
    expect(result.headers && result.headers['content-type']).toBe(
      'application/json'
    );
    expect(result.headers && result.headers['x-single']).toBe('undefined');
  });

  it('should accept a valid URL and assign it correctly', async () => {
    const response = await supertest(app)
      .get('/test/path?query=1')
      .set('Host', 'example.com')
      .set('accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body.url).toBe('http://example.com/test/path?query=1');
  });
});
