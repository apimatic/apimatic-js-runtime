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
  obj: ApiResponse<any>,
  pointer: string
): any {
  const [prefix, jsonPath] = pointer.split('#');

  if (prefix === '$response.body') {
    let body = obj.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        // ignore error
      }
      return extractValueFromJsonPointer(body, jsonPath);
    }
  } else if (prefix === '$response.headers') {
    return extractValueFromJsonPointer(obj.headers, jsonPath);
  }
  return null;
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
