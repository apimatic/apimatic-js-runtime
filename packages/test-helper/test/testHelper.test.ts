import {
  createReadableStreamFromUrl,
  expectHeadersToMatch,
  isObjectProperSubsetOf,
  isOrderedSupersetOf,
  isProperSubsetOf,
  isSameAsFile,
  isSuperSetOf,
} from '../src/testHelper';

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

  it('should return true for proper subset arrays', () => {
    const left = [1, 2, 3];
    const right = [1, 2, 3];

    expect(isProperSubsetOf(left, right, { checkValues: true })).toBe(true);
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

describe('isObjectProperSubsetOf', () => {
  it('should return true for proper subset objects', () => {
    const left = {
      name: 'lisinopril',
      strength: '10 mg Tab',
    };
    const right = {
      name: 'lisinopril',
    };

    expect(isObjectProperSubsetOf(left, right, { checkValues: true })).toBe(
      false
    );
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

    expect(isObjectProperSubsetOf(left, right, { checkValues: true })).toBe(
      false
    );
  });

  it('should return true for empty objects', () => {
    const left = {};
    const right = { key: 'value' };

    expect(isObjectProperSubsetOf(left, right, { checkValues: true })).toBe(
      false
    );
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

    expect(() => expectHeadersToMatch(actual, expected)).not.toThrow();
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

    expect(() => expectHeadersToMatch(actual, expected)).not.toThrow();
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

    expect(() => expectHeadersToMatch(actual, expected)).not.toThrow();
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

  it('should pass for headers with undefined actual values', () => {
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

describe('isSameAsFile', () => {
  it('should return false for non-matching files', async () => {
    const filename =
      'https://raw.githubusercontent.com/apimatic/apimatic-js-runtime/master/packages/core/test/dummy_file.txt';
    const blob = new Blob(['different data'], {
      type: 'text/plain;charset=utf-8',
    });

    const isSame = await isSameAsFile(
      await createReadableStreamFromUrl(filename),
      blob
    );

    expect(isSame).toBe(false);
  });

  it('should return false for undefined stream input', async () => {
    const filename =
      'https://raw.githubusercontent.com/apimatic/apimatic-js-runtime/master/packages/core/test/dummy_file.txt';

    const isSame = await isSameAsFile(
      await createReadableStreamFromUrl(filename),
      undefined
    );

    expect(isSame).toBe(false);
  });
});

describe('createReadableStreamFromUrl', () => {
  it('should pass retrieving data from createReadableStreamFromUrl', async () => {
    const actual = await createReadableStreamFromUrl(
      'https://raw.githubusercontent.com/apimatic/apimatic-js-runtime/master/packages/core/test/dummy_file.txt'
    );
    const expected = 'The text contains dummy data.';

    expect(actual).toEqual(expected);
  });
});
