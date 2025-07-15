"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expectMatchingWithOptions = exports.expectHeadersToMatch = void 0;
var tslib_1 = require("tslib");
/**
 * Compare actual headers with expected headers, ignoring case sensitivity.
 * @param actualHeaders Actual headers received from the request.
 * @param expectedHeaders Expected headers with values to match against actual headers.
 */
function expectHeadersToMatch(actualHeaders, expectedHeaders) {
    var lowerCasedHeaders = Object.keys(actualHeaders).reduce(function (acc, key) {
        acc[key.toLowerCase()] = actualHeaders[key];
        return acc;
    }, {});
    Object.entries(expectedHeaders).forEach(function (_a) {
        var _b = tslib_1.__read(_a, 2), expectedKey = _b[0], expectedValue = _b[1];
        var lowerCasedKey = expectedKey.toLowerCase();
        expect(lowerCasedHeaders).toHaveProperty(lowerCasedKey);
        if (expectedValue[1]) {
            expect(lowerCasedHeaders[lowerCasedKey]).toBe(expectedValue[0]);
        }
    });
}
exports.expectHeadersToMatch = expectHeadersToMatch;
/**
 * Check whether the expected value is matching with the actual value.
 * @param expected Expected value.
 * @param actual Actual value to be matched with expected value.
 * @param options Options for comparison of actual value with expected value.
 */
function expectMatchingWithOptions(expected, actual, options) {
    if (options === void 0) { options = {}; }
    expect(typeof actual).toEqual(typeof expected);
    var _a = options.isOrdered, isOrdered = _a === void 0 ? false : _a, _b = options.checkValues, checkValues = _b === void 0 ? false : _b, _c = options.allowExtra, allowExtra = _c === void 0 ? false : _c;
    checkIfMatching(expected, actual, isOrdered, checkValues);
    // when extra values are not allowed in actual array or object,
    // check by inverting actual and expected values.
    allowExtra || checkIfMatching(actual, expected, isOrdered, checkValues);
}
exports.expectMatchingWithOptions = expectMatchingWithOptions;
/**
 * Recursively checks if right object or array contains all the elements
 * of left object or array.
 * @param left Left value.
 * @param right Right value to be matched with left value.
 * @param isOrdered Whether to check order of elements in arrays.
 * @param checkValues Whether to check values of each key in objects.
 */
function checkIfMatching(left, right, isOrdered, checkValues) {
    function isObject(value) {
        return value !== null && typeof value === 'object';
    }
    if (Array.isArray(left) && Array.isArray(right)) {
        checkArrays(left, right, isOrdered);
    }
    else if (isObject(left) && isObject(right)) {
        checkObjects(left, right, isOrdered, checkValues);
    }
    else if (checkValues) {
        expect(left).toEqual(right);
    }
}
function checkArrays(left, right, isOrdered) {
    if (isOrdered) {
        // Check if right array is directly equal to a partial left array.
        expect(right).toEqual(expect.objectContaining(left));
        return;
    }
    // Or check if right array contains all elements from left array.
    left.forEach(function (leftVal) { return expect(right).toContainEqual(leftVal); });
}
function checkObjects(left, right, isOrdered, checkValues) {
    var rightObjKeys = Object.keys(right);
    Object.keys(left).forEach(function (key) {
        // Check if right object keys contains this key from left object.
        expect(rightObjKeys).toContainEqual(key);
        // Recursive checking for each element in left and right object.
        checkIfMatching(left[key], right[key], isOrdered, checkValues);
    });
}
