import {
  createReadableStreamFromUrl,
  isObjectProperSubsetOf,
  isOrderedSupersetOf,
  isProperSubsetOf,
  IsSameAsFile,
  isSuperSetOf,
} from '../src/testHelper';

describe('Assertion Utility Functions', () => {
  describe('isProperSubsetOf', () => {
    it('should return true for proper subset objects', () => {
      const right = {
        name: 'lisinopril',
        strength: '10 mg Tab',
      };
      const left = {
        name: 'lisinopril',
      };

      expect(isProperSubsetOf(left, right, true)).toBe(true);
    });

    it('should return true for proper subset arrays', () => {
      const left = [1, 2, 3];
      const right = [1, 2, 3];

      expect(isProperSubsetOf(left, right, true)).toBe(true);
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

      expect(isProperSubsetOf(left, right, true)).toBe(false);
    });

    it('should return false for arrays that are not proper subsets', () => {
      const left = [1, 2, 3];
      const right = [1, 4, 3];

      expect(isProperSubsetOf(left, right, true)).toBe(false);
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

      expect(isObjectProperSubsetOf(left, right, true, false, false)).toBe(
        true
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

      expect(isObjectProperSubsetOf(left, right, true, false, false)).toBe(
        false
      );
    });
  });

  describe('isOrderedSupersetOf', () => {
    it('should return true for ordered superset arrays', () => {
      const right = [1, 2, 3];
      const left = [1, 2];

      expect(isOrderedSupersetOf(left, right, true, true)).toBe(false);
    });

    it('should return false for ordered superset arrays with different elements', () => {
      const left = [1, 2, 4];
      const right = [1, 2, 3];

      expect(isOrderedSupersetOf(left, right, true, true)).toBe(false);
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

    it('should return false for arrays with different objects', () => {
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
      expect(isSuperSetOf(left, right, true, true)).toBe(false);
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

  describe('IsSameAsFile', () => {
    describe('with Blob input', () => {
      it('should return false for non-matching files', async () => {
        const filename = 'https://example.com/sample.txt';
        const blob = new Blob(['different data'], {
          type: 'text/plain;charset=utf-8',
        });

        const isSame = await IsSameAsFile(filename, blob);

        expect(isSame).toBe(false);
      });

      it('should handle errors gracefully', async () => {
        const filename = 'https://example.com/invalidfile.txt';

        const blob = new Blob(['sample data'], {
          type: 'text/plain;charset=utf-8',
        });
        const isSame = await IsSameAsFile(filename, blob);

        expect(isSame).toBe(false);
      });
    });
  });
});
