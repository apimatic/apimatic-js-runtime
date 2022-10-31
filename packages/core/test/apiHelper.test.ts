import {
  sanitizeUrl,
  updateUserAgent,
  deprecated,
  isBlob,
} from '../src/apiHelper';

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
    (_: string, userAgent: string, detail?: string, apiVersion?: string) => {
      updateUserAgent(userAgent, apiVersion, detail);
    }
  );
});

describe('test message deprecation', () => {
  test.each([
    [
      'test message deprecation with notice',
      'v1_create_refund',
      'Use v2_create_refund',
      'Method v1_create_refund is deprecated. Use v2_create_refund',
    ],
  ])(
    '%s',
    (_: string, methodName: string, notice: string, expectedResult: string) => {
      const result = deprecated(methodName, notice);
      expect(result).toStrictEqual(expectedResult);
    }
  );
});

describe('test blob type', () => {
  test.each([
    [
      'test blob type',
      new Blob([JSON.stringify({ isBlob: true })], {
        type: 'application/json',
      }),
    ],
  ])('%s', (_: string, value: unknown) => {
    isBlob(value);
  });
});
