import axios from 'axios';

export function expectHeadersToMatch(
  actualHeaders: Record<string, string>,
  expectedHeaders: Record<string, Array<string | boolean>>
) {
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

export function expectArrayToBeOrderedSuperSetOf<T>(
  actual: T[],
  expected: T[],
  checkCount: boolean
): void {
  if (checkCount) {
    expect(actual.length).toBe(expected.length); // Check if arrays have the same length

    for (let i = 0; i < actual.length; i++) {
      expect(actual[i]).toBe(expected[i]); // Check each element in the same order
    }
  } else {
    expectArraysToBeOrdered(actual, expected);
  }
}

export function expectArraysToBeOrdered<T>(actual: T[], expected: T[]): void {
  let lastIndex = 0;

  // Iterate over the expected array using for...of loop
  for (const expectedValue of expected) {
    // Search for the expected value in the actual array from the lastIndex onwards
    const indexInActual = actual.indexOf(expectedValue, lastIndex);

    // If the expected value is not found in actual, fail the test
    if (indexInActual === -1) {
      throw new Error(
        `Expected array to contain ${expectedValue} in the same order`
      );
    }

    // Update lastIndex to continue searching from the next index in actual
    lastIndex = indexInActual + 1;
  }
}

export function expectArrayToBeSuperSetOf<T>(
  actual: T[],
  expected: T[],
  checkCount: boolean
): void {
  if (checkCount) {
    // Check if arrays have the same size
    expect(actual.length).toBe(expected.length);

    // Sort both arrays before comparison
    const sortedActual = actual.slice().sort();
    const sortedExpected = expected.slice().sort();

    // Use toEqual matcher to compare arrays after sorting
    expect(sortedActual).toEqual(sortedExpected);
  } else {
    // Check if actual contains all elements of expected
    const actualSet = new Set(actual);
    const expectedSet = new Set(expected);

    for (const item of expectedSet) {
      if (!actualSet.has(item)) {
        throw new Error(`Expected arrays to contain ${item}`);
      }
    }
  }
}

export function expectObjectToMatchKeys<T>(actual: T[], expected: T[]): void {
  const actualKeys = Object.keys(actual).sort();
  const expectedKeys = Object.keys(expected).sort();

  // Assert both keys array lengths are equal
  expect(actualKeys.length).toBe(expectedKeys.length);

  // Assert both keys arrays contain the same keys in the same order
  for (let i = 0; i < actualKeys.length; i++) {
    expect(actualKeys[i]).toEqual(expectedKeys[i]);
  }
}

export async function createReadableStreamFromUrl(url: string) {
  const res = await axios({ url, method: 'GET', responseType: 'stream' });
  if (res.status !== 200) {
    throw new Error(`Unable to retrieve data from ${url}`);
  }
  return res.data;
}
