import { sanitizeUrl, updateUserAgent, deprecated } from '../src/apiHelper';

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

it('should log a warning of deprecation message', () => {
  const methodName = 'v1_create_refund';
  const notice = 'Use v2_create_refund';
  const expectedResult =
    'Warning: Method v1_create_refund is deprecated. Use v2_create_refund';
  const deprecationSpy = jest.spyOn(console, 'warn');
  deprecated(methodName, notice);
  expect(deprecationSpy).toHaveBeenCalledWith(expectedResult);
});
