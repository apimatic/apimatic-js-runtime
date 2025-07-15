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
 * Compare actual headers with expected headers, ignoring case sensitivity.
 * @param actualHeaders Actual headers received from the request.
 * @param expectedHeaders Expected headers with values to match against actual headers.
 */
export declare function expectHeadersToMatch(actualHeaders: Record<string, string>, expectedHeaders: Record<string, Array<string | boolean>>): void;
/**
 * Check whether the expected value is matching with the actual value.
 * @param expected Expected value.
 * @param actual Actual value to be matched with expected value.
 * @param options Options for comparison of actual value with expected value.
 */
export declare function expectMatchingWithOptions(expected: any, actual?: any, options?: ExpectOptions): void;
//# sourceMappingURL=assertionUtils.d.ts.map