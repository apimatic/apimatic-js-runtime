import 'jest-extended';

/**
 * Interface defining options for subset comparison functions.
 */
export interface ExpectOptions {
  /**
   * Whether extra elements are allowed in the actual object or array.
   * Default: false
   */
  allowExtra?: boolean;

  /**
   * Note: only applicable to objects (always true for arrays)
   * Whether to check primitive values for equality.
   * Default: false
   */
  checkValues?: boolean;

  /**
   * Note: only applicable to arrays (always false for objects)
   * Whether elements in the actual array should be compared in order to the expected array.
   * Default: false
   */
  isOrdered?: boolean;
}

/**
 * Check whether the expected value is matching with the actual value.
 * @param expected Expected value.
 * @param actual Actual value to be matched with expected value.
 * @param options Options for comparison of actual value with expected value.
 */
export function expectMatchingWithOptions(
  expected: any,
  actual?: any,
  options: ExpectOptions = {}
): void {
  expect(typeof expected).toEqual(typeof actual);

  const {
    isOrdered = false,
    checkValues = false,
    allowExtra = false,
  } = options;

  checkIfMatching(expected, actual, isOrdered, checkValues);
  // when extra values are not allowed in actual array or object,
  // check by inverting actual and expected values
  allowExtra || checkIfMatching(actual, expected, isOrdered, checkValues);
}

/**
 * Recursively checks if right object or array contains all the elements
 * of left object or array.
 * @param left Left value.
 * @param right Right value to be matched with left value.
 * @param isOrdered Whether to check order of elements in arrays.
 * @param checkValues Whether to check values of each key in objects.
 */
function checkIfMatching(
  left: any,
  right: any,
  isOrdered: boolean,
  checkValues: boolean
): void {
  if (Array.isArray(left) && Array.isArray(right)) {
    isOrdered
      ? // Use toEqual for ordered comparison
        expect(right).toEqual(expect.objectContaining(left))
      : // Use toIncludeAllMembers for unordered comparison
        expect(right).toIncludeAllMembers(left);
  } else if (typeof left === 'object' && typeof right === 'object') {
    // Check if right object contains all the keys from left object
    expect(Object.keys(right)).toIncludeAllMembers(Object.keys(left));
    Object.keys(left).every(
      // Recursive checking for each element in left and right object
      (key) => checkIfMatching(left[key], right[key], isOrdered, checkValues)
    );
  } else if (checkValues) {
    expect(left).toEqual(right);
  }
}

/**
 * Compare actual headers with expected headers, ignoring case sensitivity.
 * @param actualHeaders Actual headers received from the request.
 * @param expectedHeaders Expected headers with values to match against actual headers.
 */
export function expectHeadersToMatch(
  actualHeaders: Record<string, string>,
  expectedHeaders: Record<string, Array<string | boolean>>
): void {
  const lowerCasedHeaders = Object.keys(actualHeaders).reduce((acc, key) => {
    acc[key.toLowerCase()] = actualHeaders[key];
    return acc;
  }, {} as Record<string, string>);

  Object.entries(expectedHeaders).forEach(([expectedKey, expectedValue]) => {
    const lowerCasedKey = expectedKey.toLowerCase();
    expect(lowerCasedHeaders).toHaveProperty(lowerCasedKey);
    if (expectedValue[1]) {
      expect(lowerCasedHeaders[lowerCasedKey]).toBe(expectedValue[0]);
    }
  });
}
