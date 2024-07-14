import {
  HttpClientInterface,
  HttpRequest,
  HttpResponse,
} from '@apimatic/core-interfaces';
import {
  areStreamsMatching,
  expectHeadersToMatch,
  getStreamData,
  isOrderedSupersetOf,
  isProperSubsetOf,
  isSuperSetOf,
} from '../src/testHelper';
import { Readable } from 'stream';

describe('isProperSubsetOf', () => {
  it('should return true for proper subset objects', () => {
    const right = {
      name: 'lisinopril',
      strength: '10 mg Tab',
    };
    const left = {
      name: 'lisinopril',
    };

    expect(isProperSubsetOf(left, right, { checkValues: true })).toBe(false);
  });

  it('should return false for objects that are not proper subsets', () => {
    const left = {
      name: 'lisinopril',
      strength: '10 mg Tab',
    };
    const right = {
      name: 'amlodipine',
      strength: '5 mg Tab',
    };

    expect(isProperSubsetOf(left, right, { checkValues: true })).toBe(false);
  });

  it('should return true for empty objects', () => {
    const left = {};
    const right = { key: 'value' };

    expect(isProperSubsetOf(left, right, { checkValues: true })).toBe(false);
  });

  it('should return true for proper subset arrays', () => {
    const left = [1, 2, 3];
    const right = [1, 2, 3];

    expect(isProperSubsetOf(left, right, { checkValues: true })).toBe(true);
  });

  it('should return false for arrays that are not proper subsets', () => {
    const left = [1, 2, 3];
    const right = [1, 4, 3];

    expect(isProperSubsetOf(left, right, { checkValues: true })).toBe(false);
  });

  it('should return true for empty arrays', () => {
    const left: any[] = [];
    const right: any[] = [];

    expect(isProperSubsetOf(left, right, { checkValues: true })).toBe(true);
  });
});

describe('isOrderedSupersetOf', () => {
  it('should return true for ordered superset arrays', () => {
    const right = [1, 2, 3];
    const left = [1, 2];

    expect(isOrderedSupersetOf(left, right, { isOrdered: true })).toBe(false);
  });

  it('should return true for ordered superset arrays with different elements', () => {
    const left = [1, 2, 4];
    const right = [1, 2, 3];

    expect(isOrderedSupersetOf(left, right, { isOrdered: true })).toBe(true);
  });

  it('should return true for arrays with same elements but different order', () => {
    const left = [1, 2, 3];
    const right = [3, 2, 1];

    expect(isOrderedSupersetOf(left, right, { isOrdered: true })).toBe(true);
  });

  it('should return true for empty arrays', () => {
    const left: any[] = [];
    const right: any[] = [];

    expect(isOrderedSupersetOf(left, right, { isOrdered: true })).toBe(true);
  });

  it('should return false for arrays of different lengths', () => {
    const left = [1, 2];
    const right = [1, 2, 3];

    expect(isOrderedSupersetOf(left, right, { isOrdered: true })).toBe(false);
  });
});

describe('isSuperSetOf', () => {
  it('should return true for identical objects in arrays', () => {
    const left = [
      {
        name: 'lisinopril',
        strength: '10 mg Tab',
        dose: '1 tab',
        route: 'PO',
        sig: 'daily',
        pillCount: '#90',
        refills: 'Refill 3',
      },
    ];
    const right = [
      {
        name: 'lisinopril',
        strength: '10 mg Tab',
        dose: '1 tab',
        route: 'PO',
        sig: 'daily',
        pillCount: '#90',
        refills: 'Refill 3',
      },
    ];
    expect(isSuperSetOf(left, right)).toBe(true);
  });

  it('should return true for arrays with different objects', () => {
    const left = [
      {
        name: 'lisinopril',
        strength: '10 mg Tab',
      },
    ];
    const right = [
      {
        name: 'amlodipine',
        strength: '5 mg Tab',
      },
    ];
    expect(isSuperSetOf(left, right, { isOrdered: true })).toBe(true);
  });

  it('should return true for arrays with same elements but different order', () => {
    const left = [1, 2, 3];
    const right = [3, 2, 1];

    expect(isSuperSetOf(left, right)).toBe(true);
  });

  it('should return false for arrays with completely different elements', () => {
    const left = [1, 2, 3];
    const right = [4, 5, 6];

    expect(isSuperSetOf(left, right)).toBe(false);
  });

  it('should return true for empty arrays', () => {
    const left: any[] = [];
    const right: any[] = [];

    expect(isSuperSetOf(left, right)).toBe(true);
  });
});

describe('expectHeadersToMatch', () => {
  it('should pass for headers with case insensitively different keys', () => {
    const actual = {
      id: '1',
      NAME: 'Alice',
    };
    const expected = {
      ID: ['1', false],
      name: ['Alice', false],
    };

    expectHeadersToMatch(actual, expected);
  });

  it('should pass for headers with same keys but different values', () => {
    const actual = {
      id: '1',
      name: 'Alice',
    };
    const expected = {
      id: ['2', false],
      name: ['Bob', false],
    };

    expectHeadersToMatch(actual, expected);
  });

  it('should fail for headers with missing keys', () => {
    const actual = {
      id: '1',
    };
    const expected = {
      id: ['1', false],
      name: ['Bob', false],
    };

    expect(() => expectHeadersToMatch(actual, expected)).toThrow();
  });

  it('should pass for headers by checking values', () => {
    const actual = {
      id: '1',
      name: 'Alice',
    };
    const expected = {
      name: ['Alice', true],
    };

    expectHeadersToMatch(actual, expected);
  });

  it('should fail for headers with different values', () => {
    const actual = {
      id: '1',
      name: 'Alice',
    };
    const expected = {
      name: ['Bob', true],
    };

    expect(() => expectHeadersToMatch(actual, expected)).toThrow();
  });

  it('should fail for headers with undefined actual values', () => {
    const actual = {
      id: '1',
    };
    const expected = {
      id: ['1', false],
      name: ['Bob', false],
    };

    expect(() => expectHeadersToMatch(actual, expected)).toThrow();
  });
});

describe('areStreamsMatching with getStreamData', () => {
  it('should throw error for invalid stream data', async () => {
    await expect(
      getStreamData(mockHttpClientInterface, 'invalid/stream')
    ).rejects.toThrow('Unable to retrieve streaming data from invalid/stream');
  });

  it('should pass with same data', async () => {
    const expected = new Blob(['This is example data'], {
      type: 'text/plain;charset=utf-8',
    });
    const actualBlob = await getStreamData(
      mockHttpClientInterface,
      'example/getBlob'
    );
    const actualStream = await getStreamData(
      mockHttpClientInterface,
      'example/getStream'
    );

    expect(await areStreamsMatching(expected, actualBlob)).toBeTruthy();
    expect(await areStreamsMatching(expected, actualStream)).toBeTruthy();
  });

  it('should pass with same data and different types', async () => {
    const expected = new Blob(['This is example data'], {
      type: 'text/plain',
    });
    const actualBlob = await getStreamData(
      mockHttpClientInterface,
      'example/getBlob'
    );
    const actualStream = await getStreamData(
      mockHttpClientInterface,
      'example/getStream'
    );

    expect(await areStreamsMatching(expected, actualBlob)).toBeTruthy();
    expect(await areStreamsMatching(expected, actualStream)).toBeTruthy();
  });

  it('should fail with different data', async () => {
    const expected = new Blob(['different data'], {
      type: 'text/plain;charset=utf-8',
    });
    const actualBlob = await getStreamData(
      mockHttpClientInterface,
      'example/getBlob'
    );
    const actualStream = await getStreamData(
      mockHttpClientInterface,
      'example/getStream'
    );

    expect(await areStreamsMatching(expected, actualBlob)).not.toBeTruthy();
    expect(await areStreamsMatching(expected, actualStream)).not.toBeTruthy();
  });

  it('should fail when actual value is undefined', async () => {
    const expected = new Blob(['different data'], {
      type: 'text/plain;charset=utf-8',
    });

    expect(await areStreamsMatching(expected, undefined)).not.toBeTruthy();
  });
});

const mockHttpClientInterface: HttpClientInterface = (
  request: HttpRequest,
  _?: any
): Promise<HttpResponse> => {
  if (request.url === 'example/getBlob') {
    return Promise.resolve({
      statusCode: 200,
      body: new Blob(['This is example data'], {
        type: 'text/plain;charset=utf-8',
      }),
      headers: {},
    });
  }

  if (request.url === 'example/getStream') {
    return Promise.resolve({
      statusCode: 200,
      body: Readable.from('This is example data'),
      headers: {},
    });
  }

  return Promise.resolve({
    statusCode: 200,
    body: 'Invalid response as string',
    headers: {},
  });
};
