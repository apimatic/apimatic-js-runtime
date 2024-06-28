import {
  createReadableStreamFromUrl,
  expectArrayToBeOrderedSuperSetOf,
  expectArrayToBeSuperSetOf,
  expectHeadersToMatch,
  expectObjectToMatchKeys,
} from '../src/testHelper';

describe('Assertion Utility Functions', () => {
  describe('expectArrayToBeOrderedSuperSetOf', () => {
    it('should match arrays in the same order with the same size', () => {
      const actual = [1, 2, 3];
      const expected = [1, 2, 3];

      expectArrayToBeOrderedSuperSetOf(actual, expected, true); // Will pass
    });

    it('should match arrays in the same order with different sizes', () => {
      const actual = [1, 2, 3, 4];
      const expected = [1, 2, 3];

      expectArrayToBeOrderedSuperSetOf(actual, expected, false); // Will pass
    });

    it('should fail for arrays in different order with the same size', () => {
      const actual = [3, 1, 2];
      const expected = [1, 2, 3];

      expect(() =>
        expectArrayToBeOrderedSuperSetOf(actual, expected, false)
      ).toThrowError('Expected array to contain 3 in the same order');
    });

    it('should fail for arrays with different elements', () => {
      const actual = [1, 2, 3];
      const expected = [1, 3, 2];

      expect(() =>
        expectArrayToBeOrderedSuperSetOf(actual, expected, false)
      ).toThrowError('Expected array to contain 2 in the same order');
    });
  });

  describe('expectArrayToBeSuperSetOf', () => {
    it('should match arrays with same elements regardless of order and same size', () => {
      const actual = [1, 2, 3];
      const expected = [3, 2, 1];

      expectArrayToBeSuperSetOf(actual, expected, true);
    });

    it('should match arrays with same elements regardless of order and different sizes, ignoring size', () => {
      const actual = [1, 2, 3, 4];
      const expected = [3, 2, 1];

      expectArrayToBeSuperSetOf(actual, expected, false); // Will pass, order is irrelevant
    });

    it('should fail for arrays with different elements', () => {
      const actual = [1, 2, 3];
      const expected = [1, 2, 4];

      expect(() =>
        expectArrayToBeSuperSetOf(actual, expected, false)
      ).toThrowError('Expected arrays to contain 4');
    });
  });

  describe('expectObjectToMatchKeys', () => {
    it('should pass for objects with same keys in same order', () => {
      const actual = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ];
      const expected = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ];

      expect(() => expectObjectToMatchKeys(actual, expected)).not.toThrow();
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

    it('should pass for headers with by checking values ', () => {
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
  });
});
describe('Other Utility Functions', () => {
  it('should pass retrieving data from createReadableStreamFromUrl', async () => {
    const actual = await createReadableStreamFromUrl(
      'https://raw.githubusercontent.com/apimatic/apimatic-js-runtime/master/packages/core/test/dummy_file.txt'
    );
    const expected = 'The text contains dummy data.';

    expect(actual).toEqual(expected);
  });
});
