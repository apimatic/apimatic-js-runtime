/**
 * Unique symbol used to mark an object as a FormDataWrapper.
 */
const formDataWrapperMarker = Symbol('FormDataWrapper');

/**
 * Marker interface for identifying objects as FormDataWrapper instances.
 */
export interface FormDataWrapperMarker {
  [formDataWrapperMarker]: true;
}

/**
 * Represents a wrapped form-data object containing the raw data
 * and optional headers to be sent with the request.
 */
export interface FormDataWrapper extends FormDataWrapperMarker {
  data: unknown;
  headers?: Record<string, string>;
}

/**
 * Creates a FormDataWrapper object that encapsulates form-data and optional headers.
 *
 * @param data The form-data payload or object to be wrapped.
 * @param headers Optional headers to include with the form-data.
 * @returns A FormDataWrapper instance.
 */
export function createFormData(
  data: unknown,
  headers?: Record<string, string>
): FormDataWrapper {
  return {
    [formDataWrapperMarker]: true,
    data,
    headers,
  };
}

/**
 * Type guard that checks if a given value is a FormDataWrapper.
 *
 * @param result The value to validate.
 * @returns True if the value is a FormDataWrapper, false otherwise.
 */
export function isFormDataWrapper(result: unknown): result is FormDataWrapper {
  return (
    typeof result === 'object' &&
    result !== null &&
    formDataWrapperMarker in result
  );
}
