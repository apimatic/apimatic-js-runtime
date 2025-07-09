export interface Request {
  headerParams: Record<string, unknown>;
  queryParams: Record<string, unknown>;
  pathParams: Record<string, unknown>;
  body?: any;
}

export function cloneRequest<TRequest extends Request>( // shallow cloning
  request: TRequest
): TRequest {
  const cloned = Object.create(Object.getPrototypeOf(request));
  cloned.body = cloneBody(request.body);
  cloned.headerParams = { ...request.headerParams };
  cloned.queryParams = { ...request.queryParams };
  cloned.pathParams = { ...request.pathParams };
  return cloned;
}

function cloneBody(body: any | undefined): any | undefined {
  return body === null || typeof body !== 'object'
    ? body
    : Array.isArray(body)
    ? [...body.map(cloneBody)]
    : { ...JSON.parse(JSON.stringify(body)) };
}

export function updateRequestByJsonPointer(
  request: Request,
  pointer: string | null,
  updater: (value: any) => any
): void {
  if (!pointer) {
    return;
  }
  const targets: Record<string, keyof Request> = {
    '$request.body': 'body',
    '$request.path': 'pathParams',
    '$request.query': 'queryParams',
    '$request.headers': 'headerParams',
  };

  const [prefix, point = ''] = pointer.split('#');
  const key = targets[prefix];
  if (key) {
    request[key] = updateByJsonPointer(request[key], point, updater);
  }
}

function updateByJsonPointer<T>(
  obj: T,
  pointer: string,
  updater: (val: any) => any
): T {
  if (obj === undefined) {
    return obj;
  }
  if (pointer === '') {
    return updater(obj);
  }
  const pathParts = pointer.split('/').filter(Boolean);

  let current: any = obj;

  for (let i = 0; i < pathParts.length - 1; i++) {
    const key = pathParts[i];
    if (!(key in current)) {
      break;
    }
    current = current[key];
  }

  const lastKey = pathParts[pathParts.length - 1];

  current[lastKey] = updater(current[lastKey]);

  return obj;
}
