import {
  HttpMethod,
  HttpRequest,
  HttpRequestTextBody,
} from '@apimatic/core-interfaces';

const validHttpMethods: HttpMethod[] = [
  'GET',
  'DELETE',
  'HEAD',
  'OPTIONS',
  'POST',
  'PUT',
  'PATCH',
  'LINK',
  'UNLINK',
];

export function convertExpressRequest(req: any): HttpRequest {
  const method = req.method?.toUpperCase();

  if (!isHttpMethod(method)) {
    throw new Error(`Invalid HTTP method: ${req.method}`);
  }

  const host = req.get('host');
  if (!host || host.trim() === '' || host === 'undefined') {
    throw new Error('Missing host header');
  }

  const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  if (!isValidUrl(url)) {
    throw new Error(`Invalid URL: ${url}`);
  }

  const headers = req.headers;
  if (!headers || typeof headers !== 'object' || Array.isArray(headers)) {
    throw new Error(
      `Invalid headers: expected an object, got ${typeof headers}`
    );
  }

  return {
    method,
    headers: Object.entries(headers).reduce<Record<string, string>>(
      (acc, [k, v]) => {
        acc[k] = String(v);
        return acc;
      },
      {}
    ),
    url,
    body: toBodyContent(req.body),
  };
}

function isHttpMethod(method: any): method is HttpMethod {
  return validHttpMethods.includes(method);
}

function isValidUrl(url: string): boolean {
  const protocolRegex = /^https?:\/\/[^/]+/;
  const match = protocolRegex.exec(url);
  return match !== null;
}

function toBodyContent(body: unknown): HttpRequestTextBody {
  if (body === undefined || body === null) {
    return { type: 'text', content: '' };
  }

  if (Buffer.isBuffer(body)) {
    return { type: 'text', content: body.toString('utf8') };
  }

  if (typeof body === 'string') {
    return { type: 'text', content: body };
  }

  if (typeof body === 'object') {
    return {
      type: 'text',
      content: JSON.stringify(body, (_key, value) =>
        typeof value === 'bigint' ? String(value) : value
      ),
    };
  }

  return { type: 'text', content: String(body) };
}
