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

export async function createReadableStreamFromUrl(url: string) {
  const res = await axios({ url, method: 'GET', responseType: 'stream' });
  if (res.status !== 200) {
    throw new Error(`Unable to retrieve data from ${url}`);
  }
  return res.data;
}

interface JObject {
  [key: string]: any;
}

/**
 * Recursively check whether the left object or array is a proper subset of the right object or array.
 * @param left Left object or array.
 * @param right Right object or array.
 * @param checkValues Check primitive values for equality.
 * @param allowExtra Are extra elements allowed in right object or array.
 * @param isOrdered Should elements in right be compared in order to left (only applicable to arrays).
 * @returns Boolean.
 */
export function isProperSubsetOf(
  left: any,
  right?: any,
  checkValues: boolean = false,
  allowExtra: boolean = false,
  isOrdered: boolean = false
): boolean {
  if (Array.isArray(left) && Array.isArray(right)) {
    return isArrayProperSubsetOf(
      left,
      right,
      checkValues,
      allowExtra,
      isOrdered
    );
  } else if (typeof left === 'object' && typeof right === 'object') {
    return isObjectProperSubsetOf(
      left,
      right,
      checkValues,
      allowExtra,
      isOrdered
    );
  } else {
    // If types do not match (e.g., one is object and the other is array), they cannot be proper subsets
    return false;
  }
}

export function isObjectProperSubsetOf(
  left: JObject,
  right: JObject,
  checkValues: boolean,
  allowExtra: boolean,
  isOrdered: boolean
): boolean {
  for (const key in left) {
    if (Object.prototype.hasOwnProperty.call(left, key)) {
      if (!Object.prototype.hasOwnProperty.call(right, key)) {
        return false;
      }

      const leftVal = left[key];
      const rightVal = right[key];

      if (typeof leftVal === 'object') {
        // Recursive call for nested objects
        if (
          !isProperSubsetOf(
            leftVal,
            rightVal,
            checkValues,
            allowExtra,
            isOrdered
          )
        ) {
          return false;
        }
      } else if (checkValues) {
        if (
          !CheckValuesAreSameOnBothSides(
            allowExtra,
            isOrdered,
            leftVal,
            rightVal
          )
        ) {
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

export function isArrayProperSubsetOf(
  left: any[],
  right: any[],
  checkValues: boolean,
  allowExtra: boolean,
  isOrdered: boolean
): boolean {
  if (isDifferentSizeListNotAllowed(left, right, !allowExtra)) {
    return false;
  }

  if (isOrdered) {
    return isOrderedSupersetOf(left, right, !allowExtra, checkValues);
  } else {
    return isSuperSetOf(left, right, !allowExtra);
  }
}

export function isOrderedSupersetOf(
  left: any[],
  right?: any[],
  checkSize: boolean = true,
  checkValues: boolean = true
): boolean {
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
      if (!isProperSubsetOf(leftVal, rightVal, checkValues, false, false)) {
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

export function isSuperSetOf(
  left: any[],
  right?: any[],
  checkSize: boolean = false,
  checkValues: boolean = false
): boolean {
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
      const leftItem = left.find((l) =>
        isProperSubsetOf(l, item, checkValues, false, false)
      );
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

function CheckValuesAreSameOnBothSides(
  allowExtra: boolean,
  isOrdered: boolean,
  leftVal: any,
  rightVal: any
): boolean {
  let isSame = true;

  // Check if left value is an array
  if (Array.isArray(leftVal)) {
    if (
      !DoesRightValContainsSameItems(leftVal, rightVal, allowExtra, isOrdered)
    ) {
      isSame = false;
    }
  } else if (typeof leftVal === 'object' && typeof rightVal === 'object') {
    // If both leftVal and rightVal are objects, recursively check subset
    if (!isProperSubsetOf(leftVal, rightVal, true, allowExtra, isOrdered)) {
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

function DoesRightValContainsSameItems(
  leftJArray: any[],
  rightVal: any,
  allowExtra: boolean,
  isOrdered: boolean
): boolean {
  if (!Array.isArray(rightVal)) {
    return false;
  }

  const rightJArray = rightVal as any[];

  const bothArrayContainsJObject =
    IsArrayOfJObject(leftJArray) && IsArrayOfJObject(rightJArray);
  const containsJObject =
    ListContainsJObject(leftJArray) && ListContainsJObject(rightJArray);

  if (!bothArrayContainsJObject && containsJObject) {
    const leftJToken = leftJArray.filter((x) => typeof x === 'object');
    const leftArray = leftJToken as any[];
    const rightToken = rightJArray.filter((x) => typeof x === 'object');
    const rightArray = rightToken as any[];

    // Check if arrays of objects
    if (
      !isArrayProperSubsetOf(leftArray, rightArray, true, allowExtra, isOrdered)
    ) {
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

    return DoesRightValContainsSameItems(
      remainingLeftList,
      remainingRightList,
      allowExtra,
      isOrdered
    );
  } else if (typeof leftJArray[0] === 'object' && bothArrayContainsJObject) {
    // Arrays of objects comparison
    if (
      !isArrayProperSubsetOf(
        leftJArray,
        rightJArray,
        true,
        allowExtra,
        isOrdered
      )
    ) {
      return false;
    }
  }

  return true;
}

function IsArrayOfJObject(jArray: any[]): boolean {
  return jArray.every((item) => typeof item === 'object');
}

function ListContainsJObject(jArray: any[]): boolean {
  return jArray.some((item) => typeof item === 'object');
}

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on('data', (chunk: Uint8Array) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

async function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise<ArrayBuffer>((resolve, reject) => {
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
}

export async function IsSameAsFile(
  filename: string,
  input: NodeJS.ReadableStream | Blob | undefined
): Promise<boolean> {
  try {
    const fileStream = await createReadableStreamFromUrl(filename); // Assuming this function fetches the file as a readable stream
    let fileBuffer: Buffer | ArrayBuffer;

    if (typeof input === 'undefined') {
      return false;
    }

    if (input instanceof Blob) {
      const inputBuffer = await blobToArrayBuffer(input);
      fileBuffer = await streamToBuffer(fileStream);
      // Compare ArrayBuffer directly for Blobs
      return (
        Buffer.compare(Buffer.from(inputBuffer), Buffer.from(fileBuffer)) === 0
      );
    } else {
      const inputFileBuffer = await streamToBuffer(input);
      fileBuffer = await streamToBuffer(fileStream);
      // Compare Buffer for NodeJS ReadableStream
      return Buffer.compare(inputFileBuffer, fileBuffer as Buffer) === 0;
    }
  } catch (error) {
    return false;
  }
}
