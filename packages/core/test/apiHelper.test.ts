import {
  sanitizeUrl,
  updateUserAgent,
  deprecated,
  updateErrorMessage,
} from '../src/apiHelper';
import { HttpResponse } from '../../core-interfaces/lib/httpResponse';

describe('sanitizeUrl', () => {
  it('should throw error on protocol not matching http or https', () => {
    expect.hasAssertions();
    try {
      sanitizeUrl('httpx://www.example.com');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe(
        'Invalid URL format: httpx://www.example.com'
      );
    }
  });

  it('should throw error on missing protocol', () => {
    expect.hasAssertions();
    try {
      sanitizeUrl('www.example.com');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe(
        'Invalid URL format: www.example.com'
      );
    }
  });

  it('should replace each occurence of multiple consecutive forward slashes with a single slash', () => {
    const url = sanitizeUrl('http://www.example.com/path//to///resource');
    expect(url).toBe('http://www.example.com/path/to/resource');
  });

  it('should do nothing on a correctly formatted url', () => {
    const input = 'http://www.example.com/path/to/resource';
    const url = sanitizeUrl(input);
    expect(url).toBe(input);
  });
});

describe('test user agent', () => {
  test.each([
    [
      'test user agent with engine, engine version, os-info',
      'Typescript|4.8.3|{engine}|{engine-version}|{os-info}',
      undefined,
      undefined,
    ],
    [
      'test user agent with api-version, detail, engine, engine version, os-info',
      'Square-Typescript-SDK/2.0.0 ({api-version}) {engine}/{engine-version} ({os-info}) {detail}',
      'square-detail',
      '2022-10-19',
    ],
    [
      'test user agent with api-version, detail(> 128), engine, engine version, os-info',
      'Square-Typescript-SDK/2.0.0 ({api-version}) {engine}/{engine-version} ({os-info}) {detail}',
      `testing-square-details-exceeding-more-than-one-twenty-eight-characters---
       testing-square-details-exceeding-more-than-one-twenty-eight-characters---`,
      '2022-10-19',
    ],
  ])(
    '%s',
    (_: string, userAgent: string, details?: string, apiVersion?: string) => {
      try {
        const result = updateUserAgent(userAgent, apiVersion, details);
        expect(result).not.toBeNull();
      } catch (e) {
        expect(e.message).toStrictEqual(
          'userAgentDetail length exceeds 128 characters limit'
        );
      }
    }
  );
});

describe('test error template', () => {
  test.each([
    [
      'test error message with statusCode, response headers and response.body templates to be replaced',
      'Global Error template 500: {$statusCode}, accept => {$response.header.content-type}, body => {$response.body}.',
      {
        statusCode: 500,
        body: `{"scalar": 123.2,"object": {"keyA": {"keyC": true, "keyD": 34}, "keyB": "some string", "arrayScalar": ["value1", "value2"], "arrayObjects":[{"key1": 123, "key2": false}, {"key3": 1234, "key4": null}]}}`,
        headers: { 'content-type': 'text/plain' },
      } as HttpResponse,
      `Global Error template 500: 500, accept => text/plain, body => {"scalar":123.2,"object":{"keyA":{"keyC":true,"keyD":34},"keyB":"some string","arrayScalar":["value1","value2"],"arrayObjects":[{"key1":123,"key2":false},{"key3":1234,"key4":null}]}}.`,
    ],
    [
      'test error message with response.body scalar values to be replaced',
      '{$response.body#/object/arrayObjects/0/key2}-{$response.body#/scalar}-{$response.body#/object/keyA/keyC}-{$response.body#/unknownProperty}',
      {
        statusCode: 500,
        body: `{"scalar": 123.2,"object": {"keyA": {"keyC": true, "keyD": 34}, "keyB": "some string", "arrayScalar": ["value1", "value2"], "arrayObjects":[{"key1": 123, "key2": false}, {"key3": 1234, "key4": null}]}}`,
        headers: { 'content-type': 'text/plain' },
      } as HttpResponse,
      'false-123.2-true-',
    ],
    [
      'test error message with response.body non-scalar values to be replaced',
      '{$response.body#/object/keyA}-{$response.body#/object/arrayObjects}-{$response.body#/object/keyB}',
      {
        statusCode: 500,
        body: `{"scalar": 123.2,"object": {"keyA": {"keyC": true, "keyD": 34}, "keyB": "some string", "arrayScalar": ["value1", "value2"], "arrayObjects":[{"key1": 123, "key2": false}, {"key3": 1234, "key4": null}]}}`,
        headers: { 'content-type': 'text/plain' },
      } as HttpResponse,
      `{"keyC":true,"keyD":34}-[{"key1":123,"key2":false},{"key3":1234,"key4":null}]-"some string"`,
    ],
    [
      'test error message with response.body known values with # to be replaced',
      '{$response.body#/object#keyA}-{$response.body#/object#keyB}',
      {
        statusCode: 500,
        body: `{"scalar": 123.2,"object": {"keyA": {"keyC": true, "keyD": 34}, "keyB": "some string", "arrayScalar": ["value1", "value2"], "arrayObjects":[{"key1": 123, "key2": false}, {"key3": 1234, "key4": null}]}}`,
        headers: { 'content-type': 'text/plain' },
      } as HttpResponse,
      `-`,
    ],
    [
      'test error message with response.body known values with #/ to be replaced',
      '{$response.body#/object#/keyA}-{$response.body#/object#/keyB}',
      {
        statusCode: 500,
        body: `{"scalar": 123.2,"object": {"keyA": {"keyC": true, "keyD": 34}, "keyB": "some string", "arrayScalar": ["value1", "value2"], "arrayObjects":[{"key1": 123, "key2": false}, {"key3": 1234, "key4": null}]}}`,
        headers: { 'content-type': 'text/plain' },
      } as HttpResponse,
      `-`,
    ],
    [
      'test error message with response.body known values with #// to be replaced',
      '{$response.body#/object#//keyA}-{$response.body#/object#//keyB}',
      {
        statusCode: 500,
        body: `{"scalar": 123.2,"object": {"keyA": {"keyC": true, "keyD": 34}, "keyB": "some string", "arrayScalar": ["value1", "value2"], "arrayObjects":[{"key1": 123, "key2": false}, {"key3": 1234, "key4": null}]}}`,
        headers: { 'content-type': 'text/plain' },
      } as HttpResponse,
      `-`,
    ],
    [
      'test error message with response.body unknown values to be replaced',
      '{$response.body#/unknown}-{$response.body#/object/unknown}',
      {
        statusCode: 500,
        body: `{"scalar": 123.2,"object": {"keyA": {"keyC": true, "keyD": 34}, "keyB": "some string", "arrayScalar": ["value1", "value2"], "arrayObjects":[{"key1": 123, "key2": false}, {"key3": 1234, "key4": null}]}}`,
        headers: { 'content-type': 'text/plain' },
      } as HttpResponse,
      `-`,
    ],
    [
      'test error message with response header with missing . to be replaced',
      'Global Error template 500: {$statusCode}, accept => {$response.headercontent-type}.',
      {
        statusCode: 500,
        body: '{}',
        headers: { 'content-type': 'text/plain' },
      } as HttpResponse,
      `Global Error template 500: 500, accept => .`,
    ],
    [
      'test error message with case insenstive response header to be replaced',
      'Global Error template 500: {$statusCode}, accept => {$response.header.CONTENT-TYPE}.',
      {
        statusCode: 500,
        body: '{}',
        headers: { 'content-type': 'text/plain' },
      } as HttpResponse,
      `Global Error template 500: 500, accept => text/plain.`,
    ],
    [
      'test error message with response header with spaces in header name to be replaced',
      'Global Error template 500: {$statusCode}, accept => {$response.header.content - type}.',
      {
        statusCode: 500,
        body: '{}',
        headers: { 'content - type': 'text/plain' },
      } as HttpResponse,
      `Global Error template 500: 500, accept => text/plain.`,
    ],
    [
      'test error message with missing response header to be replaced',
      'Global Error template 500: {$statusCode}, accept => {$response.header.content-length}.',
      {
        statusCode: 500,
        body: '{}',
        headers: { 'content - type': 'text/plain' },
      } as HttpResponse,
      `Global Error template 500: 500, accept => .`,
    ],
  ])(
    '%s',
    (
      _: string,
      errorTemplate: string,
      response: HttpResponse,
      expectedString: string
    ) => {
      const result = updateErrorMessage(errorTemplate, response);
      expect(result).toStrictEqual(expectedString);
    }
  );
});

it('should log a warning of deprecation message', () => {
  const methodName = 'v1_create_refund';
  const notice = 'Use v2_create_refund';
  const expectedResult =
    'Warning: Method v1_create_refund is deprecated. Use v2_create_refund';
  const deprecationSpy = jest.spyOn(console, 'warn');
  deprecated(methodName, notice);
  expect(deprecationSpy).toHaveBeenCalledWith(expectedResult);
});
