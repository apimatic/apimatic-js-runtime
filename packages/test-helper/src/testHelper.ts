import { HttpClientInterface } from '@apimatic/core-interfaces';

/**
 * Get streaming data from a given URL.
 * @param client Instance of HttpClient to be used.
 * @param url URL from which to create the readable stream.
 * @returns Readable stream or Blob of data fetched from the URL.
 * @throws Error if unable to retrieve data from the URL.
 */
export async function getStreamData(
  client: HttpClientInterface,
  url: string
): Promise<NodeJS.ReadableStream | Blob> {
  const res = await client({
    method: 'GET',
    url,
    responseType: 'stream',
  });
  if (res.statusCode !== 200 || typeof res.body === 'string') {
    throw new Error(`Unable to retrieve streaming data from ${url}`);
  }
  return res.body;
}

/**
 * Check if input matches the contents of a file by comparing stream data or Blob data.
 * @param expected Expected data (NodeJS ReadableStream or Blob).
 * @param actual Input data to compare against file contents (NodeJS ReadableStream or Blob).
 * @returns Promise resolving to true if input matches file contents, otherwise false.
 */
export async function areStreamsMatching(
  expected: NodeJS.ReadableStream | Blob,
  actual: NodeJS.ReadableStream | Blob | undefined
): Promise<boolean> {
  if (typeof actual === 'undefined') {
    return false;
  }
  try {
    const expectedBuffer =
      expected instanceof Blob
        ? await blobToBuffer(expected)
        : await streamToBuffer(expected);
    const actualBuffer =
      actual instanceof Blob
        ? await blobToBuffer(actual)
        : await streamToBuffer(actual);

    return Buffer.compare(actualBuffer, expectedBuffer) === 0;
  } catch (error) {
    return false;
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

/**
 * Recursively check whether the left object or array is a proper subset of the right object or array.
 * @param left Left object or array.
 * @param right Right object or array.
 * @param options Options for subset comparison.
 * @returns Boolean indicating if left is a proper subset of right.
 */
export function isProperSubsetOf(
  left: any,
  right?: any,
  options: SubsetOptions = {}
): boolean {
  if (Array.isArray(left) && Array.isArray(right)) {
    return isArrayProperSubsetOf(left, right, options);
  } else if (typeof left === 'object' && typeof right === 'object') {
    return isObjectProperSubsetOf(left, right, options);
  } else {
    // If types do not match (e.g., one is object and the other is array), they cannot be proper subsets
    return false;
  }
}

/**
 * Check if one ordered array is a superset of another ordered array.
 * @param left Left array to check.
 * @param right Right array to check against.
 * @param options Options for subset comparison.
 * @returns Boolean indicating if left is an ordered superset of right.
 */
export function isOrderedSupersetOf(
  left: any[],
  right?: any[],
  options: SubsetOptions = {}
): boolean {
  const checkSize = !options.allowExtra;
  const checkValues = options.checkValues;
  let leftIndex = 0;
  let rightIndex = 0;

  if (typeof right === 'undefined') {
    return false;
  }

  while (rightIndex < right.length) {
    if (leftIndex >= left.length) {
      return false; // left array ended prematurely
    }

    const rightVal = right[rightIndex];
    const leftVal = left[leftIndex];

    if (typeof rightVal === 'object' && typeof leftVal === 'object') {
      if (!isProperSubsetOf(leftVal, rightVal, options)) {
        return false;
      }
    } else if (checkValues && rightVal !== leftVal) {
      return false;
    }

    leftIndex++;
    rightIndex++;
  }

  if (checkSize && leftIndex !== left.length) {
    return false; // left array is longer than right array
  }

  return true;
}

/**
 * Check if one array is a superset of another array.
 * @param left Left array to check.
 * @param right Right array to check against.
 * @param options Options for subset comparison.
 * @returns Boolean indicating if left is a superset of right.
 */
export function isSuperSetOf(
  left: any[],
  right?: any[],
  options: SubsetOptions = {}
): boolean {
  const checkSize = !options.allowExtra;
  if (
    typeof right === 'undefined' ||
    isDifferentSizeListNotAllowed(right, left, checkSize)
  ) {
    return false;
  }

  const leftCountMap = new Map<any, number>();

  // Count occurrences in left array
  for (const item of left) {
    leftCountMap.set(item, (leftCountMap.get(item) || 0) + 1);
  }

  // Check if every element in right has enough occurrences in left
  for (const item of right) {
    if (typeof item === 'object') {
      const leftItem = left.find((l) => isProperSubsetOf(l, item, options));
      if (!leftItem) {
        return false;
      }
    } else if (!leftCountMap.has(item) || leftCountMap.get(item) === 0) {
      return false;
    }

    leftCountMap.set(item, (leftCountMap.get(item) || 0) - 1);
  }

  return true;
}

interface JObject {
  [key: string]: any;
}

/**
 * Check if one object is a proper subset of another object.
 * @param left Left object to check.
 * @param right Right object to check against.
 * @param options Options for subset comparison.
 * @returns Boolean indicating if left is a proper subset of right.
 */
function isObjectProperSubsetOf(
  left: JObject,
  right: JObject,
  options: SubsetOptions = {}
): boolean {
  const { checkValues = false, allowExtra = false } = options;

  for (const key in left) {
    if (Object.prototype.hasOwnProperty.call(left, key)) {
      if (!Object.prototype.hasOwnProperty.call(right, key)) {
        return false;
      }

      const leftVal = left[key];
      const rightVal = right[key];

      if (typeof leftVal === 'object') {
        // Recursive call for nested objects
        if (!isProperSubsetOf(leftVal, rightVal, options)) {
          return false;
        }
      } else if (checkValues) {
        if (!checkValuesAreSameOnBothSides(leftVal, rightVal, options)) {
          return false;
        }
      }
    }
  }

  if (!allowExtra) {
    // Check if right object has extra keys not present in left object
    for (const key in right) {
      if (Object.prototype.hasOwnProperty.call(right, key)) {
        if (!left.hasOwnProperty(key)) {
          return false;
        }
      }
    }
  }

  return true;
}

/**
 * Check if one array is a proper subset of another array.
 * @param left Left array to check.
 * @param right Right array to check against.
 * @param options Options for subset comparison.
 * @returns Boolean indicating if left is a proper subset of right.
 */
function isArrayProperSubsetOf(
  left: any[],
  right: any[],
  options: SubsetOptions = {}
): boolean {
  const { allowExtra = false, isOrdered = false } = options;
  if (isDifferentSizeListNotAllowed(left, right, !allowExtra)) {
    return false;
  }

  if (isOrdered) {
    return isOrderedSupersetOf(left, right, options);
  } else {
    return isSuperSetOf(left, right, options);
  }
}

/**
 * Check if lists have different sizes when size checking is enabled.
 * @param rightList Right list to compare size.
 * @param leftList Left list to compare size.
 * @param checkSize Boolean indicating whether size checking is enabled.
 * @returns Boolean indicating if different size lists are not allowed.
 */
function isDifferentSizeListNotAllowed(
  rightList: any[],
  leftList: any[],
  checkSize: boolean
): boolean {
  if (checkSize && rightList.length !== leftList.length) {
    return true; // Lists have different sizes and size checking is enabled
  }
  return false; // Lists have the same size or size checking is disabled
}

/**
 * Check if values are the same on both sides for primitive value comparison.
 * @param leftVal Left value to compare.
 * @param rightVal Right value to compare.
 * @param options Options for subset comparison.
 * @returns Boolean indicating if values are the same on both sides.
 */
function checkValuesAreSameOnBothSides(
  leftVal: any,
  rightVal: any,
  options: SubsetOptions = {}
): boolean {
  let isSame = true;

  // Check if left value is an array
  if (Array.isArray(leftVal)) {
    if (!doesRightValContainsSameItems(leftVal, rightVal, options)) {
      isSame = false;
    }
  } else if (typeof leftVal === 'object' && typeof rightVal === 'object') {
    // If both leftVal and rightVal are objects, recursively check subset
    if (!isProperSubsetOf(leftVal, rightVal, options)) {
      isSame = false;
    }
  } else {
    // Compare primitive values
    if (leftVal !== rightVal) {
      isSame = false;
    }
  }

  return isSame;
}

/**
 * Check if right value contains the same items as left value for array comparison.
 * @param leftJArray Left array to compare.
 * @param rightVal Right value to compare.
 * @param options Options for subset comparison.
 * @returns Boolean indicating if right value contains the same items as left array.
 */
function doesRightValContainsSameItems(
  leftJArray: any[],
  rightVal: any,
  options: SubsetOptions = {}
): boolean {
  if (!Array.isArray(rightVal)) {
    return false;
  }

  const rightJArray = rightVal as any[];

  const bothArrayContainsJObject =
    isArrayOfJObject(leftJArray) && isArrayOfJObject(rightJArray);
  const containsJObject =
    listContainsJObject(leftJArray) && listContainsJObject(rightJArray);

  if (!bothArrayContainsJObject && containsJObject) {
    const leftJToken = leftJArray.filter((x) => typeof x === 'object');
    const leftArray = leftJToken as any[];
    const rightToken = rightJArray.filter((x) => typeof x === 'object');
    const rightArray = rightToken as any[];

    // Check if arrays of objects
    if (!isArrayProperSubsetOf(leftArray, rightArray, options)) {
      return false;
    }

    const remainingLeftListToken = leftJArray.filter(
      (x) => typeof x !== 'object'
    );
    const remainingLeftList = remainingLeftListToken as any[];
    const remainingRightListToken = rightJArray.filter(
      (x) => typeof x !== 'object'
    );
    const remainingRightList = remainingRightListToken as any[];

    return doesRightValContainsSameItems(
      remainingLeftList,
      remainingRightList,
      options
    );
  } else if (typeof leftJArray[0] === 'object' && bothArrayContainsJObject) {
    // Arrays of objects comparison
    if (!isArrayProperSubsetOf(leftJArray, rightJArray, options)) {
      return false;
    }
  }

  return true;
}

/**
 * Check if an array contains objects.
 * @param jArray Array to check.
 * @returns Boolean indicating if array contains objects.
 */
function isArrayOfJObject(jArray: any[]): boolean {
  return jArray.every((item) => typeof item === 'object');
}

/**
 * Check if an array contains at least one object.
 * @param jArray Array to check.
 * @returns Boolean indicating if array contains at least one object.
 */
function listContainsJObject(jArray: any[]): boolean {
  return jArray.some((item) => typeof item === 'object');
}

/**
 * Convert a NodeJS ReadableStream to a Buffer.
 * @param stream Readable stream to convert.
 * @returns Promise resolving to a Buffer containing stream data.
 */
async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

/**
 * Convert a Blob to a Buffer.
 * @param blob Blob to convert.
 * @returns Promise resolving to an Buffer containing blob data.
 */
async function blobToBuffer(blob: Blob): Promise<Buffer> {
  const arrayBuffer = new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read Blob as ArrayBuffer.'));
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
  return Buffer.from(await arrayBuffer);
}