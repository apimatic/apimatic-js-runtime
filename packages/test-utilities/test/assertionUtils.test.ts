import {
  expectHeadersToMatch,
  expectMatchingWithOptions,
  ExpectOptions,
} from '../src';

describe('expectMatchingWithOptions', () => {
  it('should fail by matching array and object', () => {
    const exp = {
      name: 'lisinopril',
    };
    const actl = ['lisinopril'];
    const opts: ExpectOptions = {};

    expect(() => expectMatchingWithOptions(exp, actl, opts)).toThrow();
  });

  it('should fail by matching object and undefined', () => {
    const exp = {
      name: 'lisinopril',
    };
    const actl = undefined;
    const opts: ExpectOptions = {};

    expect(() => expectMatchingWithOptions(exp, actl, opts)).toThrow();
  });

  it('should fail by matching object and a different type', () => {
    const exp = {
      name: 'lisinopril',
    };
    const actl = false;
    const opts: ExpectOptions = {};

    expect(() => expectMatchingWithOptions(exp, actl, opts)).toThrow();
  });

  it('object: should fail by missing keys', () => {
    const exp = {
      name: 'lisinopril',
    };
    const actl = {
      key: 'lisinopril',
    };
    const opts: ExpectOptions = {};

    expect(() => expectMatchingWithOptions(exp, actl, opts)).toThrow();
  });

  it('object: should pass by checking values', () => {
    const exp = {
      name: 'lisinopril',
    };
    const actl = {
      name: 'lisinopril',
    };
    const opts: ExpectOptions = {
      checkValues: true,
    };

    expectMatchingWithOptions(exp, actl, opts);
  });

  it('object: should fail by checking values', () => {
    const exp = {
      name: 'lisinopril',
    };
    const actl = {
      name: 'amlodipine',
    };
    const opts: ExpectOptions = {
      checkValues: true,
    };

    expect(() => expectMatchingWithOptions(exp, actl, opts)).toThrow();
  });

  it('object: should pass by without checking values', () => {
    const exp = {
      name: 'lisinopril',
    };
    const actl = {
      name: 'amlodipine',
    };
    const opts: ExpectOptions = {};

    expectMatchingWithOptions(exp, actl, opts);
  });

  it('object: should pass by allowing extra and checking values', () => {
    const exp = {
      name: 'lisinopril',
    };
    const actl = {
      name: 'lisinopril',
      strength: '10 mg Tab',
    };
    const opts: ExpectOptions = {
      allowExtra: true,
      checkValues: true,
    };

    expectMatchingWithOptions(exp, actl, opts);
  });

  it('object: should fail without allowing extra and checking values', () => {
    const exp = {
      name: 'lisinopril',
    };
    const actl = {
      name: 'lisinopril',
      strength: '10 mg Tab',
    };
    const opts: ExpectOptions = {
      checkValues: true,
    };

    expect(() => expectMatchingWithOptions(exp, actl, opts)).toThrow();
  });

  it('object: should pass by allowing extra without checking values', () => {
    const exp = {
      name: 'lisinopril',
    };
    const actl = {
      name: 'amlodipine',
      strength: '10 mg Tab',
    };
    const opts: ExpectOptions = {
      allowExtra: true,
    };

    expectMatchingWithOptions(exp, actl, opts);
  });

  it('object: should fail without allowing extra and without checking values', () => {
    const exp = {
      name: 'lisinopril',
    };
    const actl = {
      name: 'amlodipine',
      strength: '10 mg Tab',
    };
    const opts: ExpectOptions = {};

    expect(() => expectMatchingWithOptions(exp, actl, opts)).toThrow();
  });

  it('object: should pass when expected is empty and extra is allowed', () => {
    const exp = {};
    const actl = {
      name: 'amlodipine',
      strength: '10 mg Tab',
    };
    const opts: ExpectOptions = {
      allowExtra: true,
    };

    expectMatchingWithOptions(exp, actl, opts);
  });

  it('object: should fail when expected is empty and extra is not allowed', () => {
    const exp = {};
    const actl = {
      name: 'amlodipine',
      strength: '10 mg Tab',
    };
    const opts: ExpectOptions = {};

    expect(() => expectMatchingWithOptions(exp, actl, opts)).toThrow();
  });

  it('object: should pass with null values', () => {
    const exp = {
      name: null,
    };
    const actl = {
      name: null,
      side: 'side',
    };
    const opts: ExpectOptions = {
      allowExtra: true,
      checkValues: true,
    };

    expectMatchingWithOptions(exp, actl, opts);
  });

  it('object: should pass with undefined values', () => {
    const exp = {
      name: undefined,
    };
    const actl = {
      name: undefined,
      side: 'side',
    };
    const opts: ExpectOptions = {
      allowExtra: true,
      checkValues: true,
    };

    expectMatchingWithOptions(exp, actl, opts);
  });

  it('array: should pass without allowing extra and without ordered values', () => {
    const exp = [1, 2, 3];
    const actl = [1, 3, 2];
    const opts: ExpectOptions = {};

    expectMatchingWithOptions(exp, actl, opts);
  });

  it('array: should fail without allowing extra and without ordered values', () => {
    const exp = [1, 2, 3];
    const actl = [1, 3, 2, 66, 3, 4];
    const opts: ExpectOptions = {};

    expect(() => expectMatchingWithOptions(exp, actl, opts)).toThrow();
  });

  it('array: should pass with allowing extra and without ordered values', () => {
    const exp = [1, 2, 3];
    const actl = [1, 3, 2, 66, 3, 4];
    const opts: ExpectOptions = {
      allowExtra: true,
    };

    expectMatchingWithOptions(exp, actl, opts);
  });

  it('array: should fail with allowing extra and without ordered values', () => {
    const exp = [1, 2, 3];
    const actl = [1, 3, 66, 3, 4];
    const opts: ExpectOptions = {
      allowExtra: true,
    };

    expect(() => expectMatchingWithOptions(exp, actl, opts)).toThrow();
  });

  it('array: should pass with ordered values', () => {
    const exp = [1, 2, 3];
    const actl = [1, 2, 3];
    const opts: ExpectOptions = {
      isOrdered: true,
    };

    expectMatchingWithOptions(exp, actl, opts);
  });

  it('array: should fail with ordered values', () => {
    const exp = [1, 2, 3];
    const actl = [1, 3, 2];
    const opts: ExpectOptions = {
      isOrdered: true,
    };

    expect(() => expectMatchingWithOptions(exp, actl, opts)).toThrow();
  });

  it('array: should pass with allowing extra and with ordered values', () => {
    const exp = [1, 2, 3];
    const actl = [1, 2, 3, 4];
    const opts: ExpectOptions = {
      isOrdered: true,
      allowExtra: true,
    };

    expectMatchingWithOptions(exp, actl, opts);
  });

  it('array: should fail with allowing extra and with ordered values', () => {
    const exp = [1, 2, 3];
    const actl = [1, 0, 2, 0, 3];
    const opts: ExpectOptions = {
      isOrdered: true,
      allowExtra: true,
    };

    expect(() => expectMatchingWithOptions(exp, actl, opts)).toThrow();
  });

  it('array: should pass when expected is empty', () => {
    const exp: never[] = [];
    const actl = [1, 2, 3, 4];
    const opts: ExpectOptions = {
      isOrdered: true,
      allowExtra: true,
    };

    expectMatchingWithOptions(exp, actl, opts);
  });

  it('array: should pass when both expected and actual are empty', () => {
    const exp: never[] = [];
    const actl: never[] = [];
    const opts: ExpectOptions = {
      isOrdered: true,
      allowExtra: true,
    };

    expectMatchingWithOptions(exp, actl, opts);
  });

  it('array: should pass comparing null and undefined', () => {
    const exp = [null, undefined, '214'];
    const actl = [null, '214', undefined, 3];
    const opts: ExpectOptions = {
      allowExtra: true,
    };

    expectMatchingWithOptions(exp, actl, opts);
  });

  it('array: should pass with same objects', () => {
    const exp = [
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
    const actl = [
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
    const opts: ExpectOptions = {
      isOrdered: true,
      allowExtra: true,
    };

    expectMatchingWithOptions(exp, actl, opts);
  });

  it('array: should fail with different objects', () => {
    const exp = [
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
    const actl = [
      {
        name: 'lisinopril',
      },
    ];
    const opts: ExpectOptions = {
      isOrdered: true,
      allowExtra: true,
    };

    expect(() => expectMatchingWithOptions(exp, actl, opts)).toThrow();
  });
});

describe('expectHeadersToMatch', () => {
  it('should pass for headers with case insensitively different keys', () => {
    const actl = {
      id: '1',
      NAME: 'Alice',
    };
    const exp = {
      ID: ['1', false],
      name: ['Alice', false],
    };

    expectHeadersToMatch(actl, exp);
  });

  it('should pass for headers with same keys but different values', () => {
    const actl = {
      id: '1',
      name: 'Alice',
    };
    const exp = {
      id: ['2', false],
      name: ['Bob', false],
    };

    expectHeadersToMatch(actl, exp);
  });

  it('should fail for headers with missing keys', () => {
    const actl = {
      id: '1',
    };
    const exp = {
      id: ['1', false],
      name: ['Bob', false],
    };

    expect(() => expectHeadersToMatch(actl, exp)).toThrow();
  });

  it('should pass for headers by checking values', () => {
    const actl = {
      id: '1',
      name: 'Alice',
    };
    const exp = {
      name: ['Alice', true],
    };

    expectHeadersToMatch(actl, exp);
  });

  it('should fail for headers with different values', () => {
    const actl = {
      id: '1',
      name: 'Alice',
    };
    const exp = {
      name: ['Bob', true],
    };

    expect(() => expectHeadersToMatch(actl, exp)).toThrow();
  });
});
