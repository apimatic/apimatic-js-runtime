import { ApiResponse } from './coreInterfaces';

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
  response: ApiResponse<any>,
  pointer: string
): any {
  const [prefix, jsonPath] = pointer.split('#');

  if (prefix === '$response.body') {
    return extractFromResponseBody(response.body, jsonPath);
  }

  if (prefix === '$response.headers') {
    return extractValueFromJsonPointer(response.headers, jsonPath);
  }

  return null;
}

function extractFromResponseBody(body: any, jsonPath: string): any {
  if (typeof body !== 'string') {
    return null;
  }

  try {
    body = JSON.parse(body);
  } catch {
    // ignore error
  }
  return extractValueFromJsonPointer(body, jsonPath);
}

function extractValueFromJsonPointer(obj: any, pointer: string): any {
  if (pointer === '') {
    return obj;
  }

  const pathParts = pointer.split('/').filter(Boolean);

  let result = obj;
  for (const key of pathParts) {
    if (!result || typeof result !== 'object' || !(key in result)) {
      return null;
    }
    result = result[key];
  }
  return result;
}
