/**
 * Interface defining options for subset comparison functions.
 */
interface SubsetOptions {
  /**
   * Whether to check primitive values for equality.
   * Default: false
   */
  checkValues?: boolean;

  /**
   * Whether extra elements are allowed in the right object or array.
   * Default: false
   */
  allowExtra?: boolean;

  /**
   * Whether elements in the right array should be compared in order to the left array (only applicable to arrays).
   * Default: false
   */
  isOrdered?: boolean;
}
