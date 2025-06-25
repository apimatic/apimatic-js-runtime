import {
  CursorPagination,
  PagedData,
  createCursorPagedResponse,
  createNumberPagedResponse,
  createOffsetPagedResponse,
  createLinkPagedResponse,
  PagePagination,
  OffsetPagination,
  PagedResponse,
  LinkPagination,
  isLinkPagedResponse,
  isNumberPagedResponse,
} from '../src';
import { PaginationStrategy } from '../src/paginationStrategy';
import { ApiResponse, RequestBuilder } from '../src/core';
import {
  ApiError,
  createRequestBuilderFactory,
  HttpMethod,
  HttpRequest,
  passThroughInterceptor,
} from '@apimatic/core';

const expectedPages = [
  ['item1', 'item2'],
  ['item3', 'item4'],
  ['item5', 'item6'],
];
const expectedItems = expectedPages.reduce((acc, curr) => acc.concat(curr), []);

const mockResponses: Record<string, string> = {
  page1: JSON.stringify({
    data: expectedPages[0],
    nextLink: 'https://apimatic.hopto.org:3000/test/pagination?nextLink=page2',
    nextCursor: 'cursor2',
  }),
  page2: JSON.stringify({
    data: expectedPages[1],
    nextLink: 'https://apimatic.hopto.org:3000/test/pagination?nextLink=page3',
    nextCursor: 'cursor3',
  }),
  page3: JSON.stringify({
    data: expectedPages[2],
    nextLink: null,
    nextCursor: 'cursor4',
  }),
  empty: JSON.stringify({ data: [], nextCursor: null }),
  error: JSON.stringify({ error: 'Bad Request' }),
  noData: JSON.stringify({}),
};

const mockResponsesMultiple: Record<string, string> = {
  page1: JSON.stringify({
    data: expectedPages[0],
    nextLink: null,
    nextCursor: 'cursor2',
  }),
  page2: JSON.stringify({
    data: expectedPages[1],
    nextLink: 'https://apimatic.hopto.org:3000/test/pagination?nextLink=page3',
    nextCursor: 'cursor3',
  }),
  page3: JSON.stringify({
    data: expectedPages[2],
    nextLink: null,
    nextCursor: 'cursor4',
  }),
  empty: JSON.stringify({ data: [], nextCursor: null }),
};

function executor(
  pagination: PaginationStrategy | null,
  responses: Record<string, string> = mockResponses
): (requestBuilder: RequestBuilder<any, any>) => Promise<ApiResponse<any>> {
  return async (requestBuilder: RequestBuilder<any, any>) => {
    const request = requestBuilder.toRequest();
    const queryString = request.url.split('?')[1] || '';
    const params = new URLSearchParams(queryString);

    if (pagination instanceof PagePagination) {
      const page = parseInt(params.get('page') || '1', 10);
      const pageMap: Record<number, keyof typeof responses> = {
        1: 'page1',
        2: 'page2',
        3: 'page3',
      };
      return createApiResponse(
        request,
        responses[pageMap[page]] || responses.empty
      );
    }

    if (pagination instanceof OffsetPagination) {
      const offset = parseInt(params.get('offset') || '0', 10);
      const offsetMap: Record<number, keyof typeof responses> = {
        0: 'page1',
        2: 'page2',
        4: 'page3',
      };
      return createApiResponse(
        request,
        responses[offsetMap[offset]] || responses.empty
      );
    }

    if (pagination instanceof LinkPagination) {
      const nextLink = params.get('nextLink');
      const linkMap: Record<string, keyof typeof responses> = {
        page2: 'page2',
        page3: 'page3',
      };
      return nextLink
        ? createApiResponse(
            request,
            responses[linkMap[nextLink]] || responses.empty
          )
        : createApiResponse(request, responses.page1);
    }

    if (pagination instanceof CursorPagination) {
      const cursor = params.get('cursor') || 'cursor1';
      if (cursor === 'cursor1') {
        return createApiResponse(request, mockResponses.page1);
      } else if (cursor === 'cursor2') {
        return createApiResponse(request, mockResponses.page2);
      } else if (cursor === 'cursor3') {
        return createApiResponse(request, mockResponses.page3);
      } else {
        return createApiResponse(request, mockResponses.empty);
      }
    }

    return createApiResponse(request, responses.empty);
  };
}

function createApiResponse(
  request: HttpRequest,
  body: string,
  success: boolean = true
): ApiResponse<any> {
  return {
    request,
    body,
    statusCode: success ? 200 : 400,
    headers: {},
    result: JSON.parse(body),
  };
}

function getRequestBuilder(): RequestBuilder<string, boolean> {
  const defaultRequestBuilder = createRequestBuilderFactory<string, boolean>(
    async (_) => ({ statusCode: 200, body: '', headers: {} }),
    () => 'https://apimatic.hopto.org:3000',
    ApiError,
    () => passThroughInterceptor,
    {
      maxNumberOfRetries: 3,
      retryOnTimeout: false,
      retryInterval: 1,
      maximumRetryWaitTime: 3,
      backoffFactor: 2,
      httpStatusCodesToRetry: [
        408,
        413,
        429,
        500,
        502,
        503,
        504,
        521,
        522,
        524,
      ],
      httpMethodsToRetry: ['GET', 'PUT'] as HttpMethod[],
    }
  );
  const requestBuilder = defaultRequestBuilder('GET', '/test/pagination');
  requestBuilder.baseUrl('default');
  return requestBuilder;
}

function getPagedData(
  requestBuilder: RequestBuilder<string, any>,
  pagination: PaginationStrategy,
  pageResponseCreator: (response: PagedResponse<any, any> | null) => any
) {
  return new PagedData(
    requestBuilder,
    executor(pagination),
    pageResponseCreator,
    (res) => res.result.data,
    pagination
  );
}

async function collect<T>(iterable: AsyncIterable<T>): Promise<T[]> {
  const values: T[] = [];
  for await (const item of iterable) {
    values.push(item);
  }
  return values;
}

describe('Page-based pagination', () => {
  const expectedNumberPages = expectedPages.map((items, index) => ({
    items,
    pageNumber: `${index + 1}`,
  }));

  function createNumberPagedData(value: number | undefined) {
    const requestBuilder = getRequestBuilder();
    requestBuilder.query('page', value);
    return getPagedData(
      requestBuilder,
      new PagePagination('$request.query#/page'),
      createNumberPagedResponse
    );
  }

  it('should iterate through pages correctly', async () => {
    const pagedData = createNumberPagedData(1);

    const items = await collect(pagedData);

    expect(items).toEqual(expectedItems);
  });

  it('should iterate through pages as pages', async () => {
    const pagedData = createNumberPagedData(1);

    const pages = await collect(pagedData.pages());

    expect(pages).toMatchObject(expectedNumberPages);
  });

  it('should use 1 as pageNumber when it is undefined', async () => {
    const pagedData = createNumberPagedData(undefined);

    const pages = await collect(pagedData.pages());

    expect(pages).toMatchObject<Array<{ items: string[]; pageNumber: string }>>(
      expectedNumberPages
    );
  });

  it('should start iteration from 2nd page when pageNumber is 2', async () => {
    const pagedData = createNumberPagedData(2);

    const pages = await collect(pagedData.pages());

    expect(pages).toMatchObject(expectedNumberPages.slice(-2));
  });
});

describe('Offset-based pagination', () => {
  const expectedOffsetPages = expectedPages.map((items, index) => ({
    items,
    offset: `${index * 2}`,
  }));

  function createOffsetPagedData(value: number | undefined) {
    const requestBuilder = getRequestBuilder();
    requestBuilder.query('offset', value);
    return getPagedData(
      requestBuilder,
      new OffsetPagination('$request.query#/offset'),
      createOffsetPagedResponse
    );
  }

  it('should iterate through pages using offset', async () => {
    const pagedData = createOffsetPagedData(0);
    const items = await collect(pagedData);

    expect(items).toEqual(expectedItems);
  });

  it('should iterate through pages as pages using offset', async () => {
    const pagedData = createOffsetPagedData(0);
    const pages = await collect(pagedData.pages());

    expect(pages).toMatchObject(expectedOffsetPages);
  });

  it('should use 0 as offset when it is undefined', async () => {
    const pagedData = createOffsetPagedData(undefined);
    const pages = await collect(pagedData.pages());

    expect(pages).toMatchObject(expectedOffsetPages);
  });

  it('should start iteration from 2nd item when offset is 2', async () => {
    const pagedData = createOffsetPagedData(2);
    const pages = await collect(pagedData.pages());

    expect(pages).toMatchObject(expectedOffsetPages.slice(-2));
  });
});

describe('Link-based pagination', () => {
  const expectedLinkPages = expectedPages.map((items, index) => ({
    items,
    nextLink:
      index === 0
        ? null
        : `https://apimatic.hopto.org:3000/test/pagination?nextLink=page${
            index + 1
          }`,
  }));

  function createLinkPagedData(value: number | undefined) {
    const requestBuilder = getRequestBuilder();
    requestBuilder.query('page', value);
    return getPagedData(
      requestBuilder,
      new LinkPagination('$response.body#/nextLink'),
      createLinkPagedResponse
    );
  }

  it('should iterate through pages using next links', async () => {
    const pagedData = createLinkPagedData(1);
    const items = await collect(pagedData);

    expect(items).toEqual(expectedItems);
  });

  it('should iterate through pages as pages using next links', async () => {
    const pagedData = createLinkPagedData(1);
    const pages = await collect(pagedData.pages());

    expect(pages).toMatchObject(expectedLinkPages);
  });
});

describe('Cursor-based pagination', () => {
  const expectedCursorPages = expectedPages.map((items, index) => ({
    items,
    nextCursor: `cursor${index + 1}`,
  }));

  function createCursorPagedData(value: string | undefined) {
    const requestBuilder = getRequestBuilder();
    requestBuilder.query('cursor', value);
    return getPagedData(
      requestBuilder,
      new CursorPagination(
        '$request.query#/cursor',
        '$response.body#/nextCursor'
      ),
      createCursorPagedResponse
    );
  }

  it('should iterate through pages using cursor', async () => {
    const pagedData = createCursorPagedData('cursor1');
    const items = await collect(pagedData);

    expect(items).toEqual(expectedItems);
  });

  it('should iterate through pages as pages using cursor', async () => {
    const pagedData = createCursorPagedData('cursor1');
    const pages = await collect(pagedData.pages());

    expect(pages).toMatchObject(expectedCursorPages);
  });

  it('should return null cursor for 1st page when cursor is undefined', async () => {
    const pagedData = createCursorPagedData(undefined);

    const pages = await collect(pagedData.pages());
    const modifiedExpectedCursorPages = expectedCursorPages.map(
      (page, index) => ({
        ...page,
        nextCursor: index === 0 ? null : page.nextCursor,
      })
    );

    expect(pages).toMatchObject(modifiedExpectedCursorPages);
  });

  it('should return 1st page only as nextCursor pointer is invalid', async () => {
    const requestBuilder = getRequestBuilder();
    requestBuilder.query('cursor', 'cursor1');
    const pagedData = getPagedData(
      requestBuilder,
      new CursorPagination(
        '$request.query#/cursor',
        '$response.body#/next-Cursor'
      ),
      createCursorPagedResponse
    );

    const pages = await collect(pagedData.pages());

    expect(pages).toMatchObject(expectedCursorPages.slice(0, 1));
  });
});

describe('Multiple pagination', () => {
  it('should use page pagination without falling back to link pagination ', async () => {
    const requestBuilder = getRequestBuilder();
    requestBuilder.query('page', 1);

    const pagedData = new PagedData(
      requestBuilder,
      executor(
        new PagePagination('$request.query#/page'),
        mockResponsesMultiple
      ),
      (p) => p!,
      (res) => res.result.data,
      new LinkPagination('$response.body#/nextLink'),
      new PagePagination('$request.query#/page')
    );

    const pages = await collect(pagedData.pages());

    expect(pages.map((p) => p.items)).toEqual(expectedPages);

    expect(isLinkPagedResponse(pages[0])).toBeTruthy();
    expect(isNumberPagedResponse(pages[1])).toBeTruthy();
    expect(isNumberPagedResponse(pages[2])).toBeTruthy();
  });
});

describe('Error handling', () => {
  it('should handle none paginationStrategies in arguments', async () => {
    const pagedData = new PagedData(
      getRequestBuilder(),
      executor(null),
      (p) => p,
      (res) => res.result.data
    );

    const items = await collect(pagedData);

    expect(items).toEqual([]);
  });

  it('should handle undefined data from getData', async () => {
    const requestBuilder = getRequestBuilder();
    requestBuilder.query('offset', 0);
    const pagedData = new PagedData(
      getRequestBuilder(),
      executor(new OffsetPagination('$request.query#/offset')),
      createOffsetPagedResponse,
      (_) => undefined
    );

    const items = await collect(pagedData);

    expect(items).toEqual([]);
  });

  it('should handle 400 status code from callAsJson', async () => {
    const pagedData = new PagedData(
      getRequestBuilder(),
      async (_: RequestBuilder<any, any>) => {
        throw new Error();
      },
      createNumberPagedResponse,
      (res) => res.result.data,
      new PagePagination('$request.query#/page')
    );

    await expect(async () => collect(pagedData)).rejects.toThrow();
  });
});
