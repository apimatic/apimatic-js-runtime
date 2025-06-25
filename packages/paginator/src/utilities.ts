import { ApiResponse } from './core';

export function extractQueryParams(link: string): Record<string, string> {
  const result: Record<string, string> = {};

  const [, query] = link.split('?');

  const decodedEqualsQuery = decodeURIComponent(query);
  const queryParams = decodedEqualsQuery.split('&');

  for (const queryParam of queryParams) {
    const [key, value] = queryParam.split('=');
    if (key) {
      result[decodeURIComponent(key)] = decodeURIComponent(value || '');
    }
  }
  return result;
}

export function getValueByJsonPointer(
  obj: ApiResponse<any>,
  pointer: string
): any {
  const [prefix, jsonPath] = pointer.split('#');

  switch (prefix) {
    case '$response.body':
      return extractValueFromJsonPointer(obj.body, jsonPath);

    case '$response.headers':
      return extractValueFromJsonPointer(obj.headers, jsonPath);

    default:
      return null;
  }
}

function extractValueFromJsonPointer<T>(obj: T, pointer: string): any {
  if (!pointer) {
    return null;
  }

  let current = obj;
  if (typeof current === 'string') {
    try {
      current = JSON.parse(current);
    } catch {
      return null;
    }
  }

  const pathParts = pointer.split('/').filter(Boolean);

  return getValueAtPath(current, pathParts);
}

function getValueAtPath(obj: any, pathParts: string[]): any {
  let result = obj;
  for (const key of pathParts) {
    if (!result || typeof result !== 'object' || !(key in result)) {
      return null;
    }
    result = result[key];
  }
  return result;
}
