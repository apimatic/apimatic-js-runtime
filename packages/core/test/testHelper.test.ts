import {
  expectArrayToBeOrderedSuperSetOf,
  expectArrayToBeSuperSetOf,
  expectObjectToMatchKeys,
} from '../src/testHelper'; // Adjust the path as per your file structure

describe('Array Utility Functions', () => {
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
});
