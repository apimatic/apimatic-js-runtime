import {
  CursorPagination,
  createPagedData,
  createCursorPagedResponse,
  createNumberPagedResponse,
  createOffsetPagedResponse,
  createLinkPagedResponse,
  PagePagination,
  OffsetPagination,
  LinkPagination,
  isLinkPagedResponse,
  isNumberPagedResponse,
  OffsetPagedResponse,
  NumberPagedResponse,
  LinkPagedResponse,
  CursorPagedResponse,
} from '../src';
import { PaginationStrategy } from '../src/paginationStrategy';
import { ApiResponse, PagedAsyncIterable } from '../src/coreInterfaces';

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
  undefinedData: JSON.stringify({}),
  nullData: JSON.stringify({ data: null }),
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
  }),
  page3: JSON.stringify({
    data: expectedPages[2],
    nextLink: null,
  }),
  empty: JSON.stringify({ data: [] }),
};

class MockRequest {
  public params: Record<string, unknown> = {};

  public createApiResponse(body: string): ApiResponse<any> {
    return {
      request: {
        method: 'GET',
        url: '',
      },
      body,
      statusCode: 200,
      headers: {},
      result: JSON.parse(body),
    };
  }

  public updateByPointer(
    key: string,
    setter: (value: any) => any
  ): MockRequest {
    const cloned: MockRequest = Object.create(Object.getPrototypeOf(this));
    cloned.params = { ...this.params };
    cloned.params[key] = setter(cloned.params[key]);
    return cloned;
  }
}

function executor(
  pagination: PaginationStrategy | null = new PagePagination(
    '$request.query#/page'
  ),
  responses: Record<string, string> = mockResponses
): (request: MockRequest) => Promise<ApiResponse<any>> {
  return async (request) => {
    if (pagination instanceof PagePagination) {
      const page = parseInt(String(request.params.page ?? 1), 10);
      const pageMap: Record<number, string> = {
        1: 'page1',
        2: 'page2',
        3: 'page3',
      };
      return request.createApiResponse(
        responses[pageMap[page]] || responses.empty
      );
    }

    if (pagination instanceof OffsetPagination) {
      const offset = parseInt(String(request.params.offset ?? 0), 10);
      const offsetMap: Record<number, string> = {
        0: 'page1',
        2: 'page2',
        4: 'page3',
      };
      return request.createApiResponse(
        responses[offsetMap[offset]] || responses.empty
      );
    }

    if (pagination instanceof CursorPagination) {
      const cursor = String(request.params.cursor ?? 'cursor1');
      const cursorMap: Record<string, string> = {
        cursor1: 'page1',
        cursor2: 'page2',
        cursor3: 'page3',
      };
      return request.createApiResponse(
        responses[cursorMap[cursor]] || responses.empty
      );
    }

    if (pagination instanceof LinkPagination) {
      const nextLink = String(request.params.nextLink ?? 'page1');
      return request.createApiResponse(responses[nextLink] || responses.empty);
    }

    return request.createApiResponse(responses.empty);
  };
}

function getRequestBuilder(key: string, value: unknown): MockRequest {
  const request = new MockRequest();
  request.params[key] = value;
  return request;
}

function updater(
  key: string
): (
  request: MockRequest
) => (pointer: string | null, setter: (value: any) => any) => MockRequest {
  return (request) => (_, setter) => {
    return request.updateByPointer(key, setter);
  };
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

  function createNumberPagedData(
    value: number | undefined
  ): PagedAsyncIterable<any, NumberPagedResponse<any, any>> {
    return createPagedData(
      executor(new PagePagination('$request.query#/page')),
      createNumberPagedResponse,
      (res) => res.result.data,
      new PagePagination('$request.query#/page')
    )(getRequestBuilder('page', value), updater('page'));
  }

  it('should iterate through pages correctly', async () => {
    const pagedData = createNumberPagedData(1);

    const items = await collect(pagedData);

    expect(items).toEqual(expectedItems);
  });

  it('should iterate through pages as pages', async () => {
    const pagedData = createNumberPagedData(1);

    const pages = await collect(pagedData.pages);

    expect(pages).toMatchObject(expectedNumberPages);
  });

  it('should use 1 as pageNumber when it is undefined', async () => {
    const pagedData = createNumberPagedData(undefined);

    const pages = await collect(pagedData.pages);

    expect(pages).toMatchObject<Array<{ items: string[]; pageNumber: string }>>(
      expectedNumberPages
    );
  });

  it('should start iteration from 2nd page when pageNumber is 2', async () => {
    const pagedData = createNumberPagedData(2);

    const pages = await collect(pagedData.pages);

    expect(pages).toMatchObject(expectedNumberPages.slice(-2));
  });
});

describe('Offset-based pagination', () => {
  const expectedOffsetPages = expectedPages.map((items, index) => ({
    items,
    offset: `${index * 2}`,
  }));

  function createOffsetPagedData(
    value: number | undefined
  ): PagedAsyncIterable<any, OffsetPagedResponse<any, any>> {
    return createPagedData(
      executor(new OffsetPagination('$request.query#/offset')),
      createOffsetPagedResponse,
      (res) => res.result.data,
      new OffsetPagination('$request.query#/offset')
    )(getRequestBuilder('offset', value), updater('offset'));
  }

  it('should iterate through pages using offset', async () => {
    const pagedData = createOffsetPagedData(0);
    const items = await collect(pagedData);

    expect(items).toEqual(expectedItems);
  });

  it('should iterate through pages as pages using offset', async () => {
    const pagedData = createOffsetPagedData(0);
    const pages = await collect(pagedData.pages);

    expect(pages).toMatchObject(expectedOffsetPages);
  });

  it('should use 0 as offset when it is undefined', async () => {
    const pagedData = createOffsetPagedData(undefined);
    const pages = await collect(pagedData.pages);

    expect(pages).toMatchObject(expectedOffsetPages);
  });

  it('should start iteration from 2nd item when offset is 2', async () => {
    const pagedData = createOffsetPagedData(2);
    const pages = await collect(pagedData.pages);

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

  function createLinkPagedData(
    value: number | undefined
  ): PagedAsyncIterable<any, LinkPagedResponse<any, any>> {
    return createPagedData(
      executor(new LinkPagination('$response.body#/nextLink')),
      createLinkPagedResponse,
      (res) => res.result.data,
      new LinkPagination('$response.body#/nextLink')
    )(getRequestBuilder('page', value), updater('nextLink'));
  }

  it('should iterate through pages using next links', async () => {
    const pagedData = createLinkPagedData(1);
    const items = await collect(pagedData);

    expect(items).toEqual(expectedItems);
  });

  it('should iterate through pages as pages using next links', async () => {
    const pagedData = createLinkPagedData(1);
    const pages = await collect(pagedData.pages);

    expect(pages).toMatchObject(expectedLinkPages);
  });
});

describe('Cursor-based pagination', () => {
  const expectedCursorPages = expectedPages.map((items, index) => ({
    items,
    nextCursor: `cursor${index + 1}`,
  }));

  function createCursorPagedData(
    value: string | undefined,
    nextCursor: string = '$response.body#/nextCursor'
  ): PagedAsyncIterable<any, CursorPagedResponse<any, any>> {
    return createPagedData(
      executor(new CursorPagination('$request.query#/cursor', nextCursor)),
      createCursorPagedResponse,
      (res) => res.result.data,
      new CursorPagination('$request.query#/cursor', nextCursor)
    )(getRequestBuilder('cursor', value), updater('cursor'));
  }

  it('should iterate through pages using cursor', async () => {
    const pagedData = createCursorPagedData('cursor1');
    const items = await collect(pagedData);

    expect(items).toEqual(expectedItems);
  });

  it('should iterate through pages as pages using cursor', async () => {
    const pagedData = createCursorPagedData('cursor1');
    const pages = await collect(pagedData.pages);

    expect(pages).toMatchObject(expectedCursorPages);
  });

  it('should return null cursor for 1st page when cursor is undefined', async () => {
    const pagedData = createCursorPagedData(undefined);

    const pages = await collect(pagedData.pages);
    const modifiedExpectedCursorPages = expectedCursorPages.map(
      (page, index) => ({
        ...page,
        nextCursor: index === 0 ? null : page.nextCursor,
      })
    );

    expect(pages).toMatchObject(modifiedExpectedCursorPages);
  });

  it('should return 1st page only as nextCursor pointer is invalid', async () => {
    const requestBuilder = getRequestBuilder('cursor', 'cursor1');
    requestBuilder.params.cursor = 'cursor1';
    const pagedData = createCursorPagedData(
      'cursor1',
      '$response.body#/next-Cursor'
    );

    const pages = await collect(pagedData.pages);

    expect(pages).toMatchObject(expectedCursorPages.slice(0, 1));
  });
});

describe('Multiple pagination', () => {
  it('should use page pagination without falling back to link pagination ', async () => {
    const pagedData = createPagedData(
      executor(
        new PagePagination('$request.query#/page'),
        mockResponsesMultiple
      ),
      (p) => p!,
      (res) => res.result.data,
      new LinkPagination('$response.body#/nextLink'),
      new PagePagination('$request.query#/page')
    )(getRequestBuilder('page', 1), updater('page'));

    const pages = await collect(pagedData.pages);

    expect(pages.map((p) => p.items)).toEqual(expectedPages);

    expect(isLinkPagedResponse(pages[0])).toBeTruthy();
    expect(isNumberPagedResponse(pages[1])).toBeTruthy();
    expect(isNumberPagedResponse(pages[2])).toBeTruthy();

    const pages2 = await collect(pagedData.pages);

    expect(pages2.map((p) => p.items)).toEqual(expectedPages);

    expect(isLinkPagedResponse(pages2[0])).toBeTruthy();
    expect(isNumberPagedResponse(pages2[1])).toBeTruthy();
    expect(isNumberPagedResponse(pages2[2])).toBeTruthy();
  });
});

describe('Error handling', () => {
  it('should have no pages when paginationStrategies are missing', async () => {
    const pagedData = createPagedData(
      async (_: MockRequest) => fail(),
      (_) => fail(),
      (_) => fail()
    )(getRequestBuilder('', undefined), updater(''));

    expect(await collect(pagedData.pages)).toEqual([]);
  });

  async function verifyNoPages(responseBody: string) {
    const pagedData = createPagedData(
      async (req: MockRequest) => req.createApiResponse(responseBody),
      (_) => fail(),
      (res) => res.result.data,
      new OffsetPagination('$request.query#/offset')
    )(getRequestBuilder('', undefined), updater(''));

    expect(await collect(pagedData.pages)).toEqual([]);
  }

  it('should have no pages for undefined data', async () => {
    verifyNoPages(mockResponses.undefinedData);
  });

  it('should have no pages for null data', async () => {
    verifyNoPages(mockResponses.nullData);
  });

  it('should have no pages for empty data', async () => {
    verifyNoPages(mockResponses.empty);
  });

  it('should throw errors from executor', async () => {
    const pagedData = createPagedData(
      async (_: MockRequest) => {
        throw new Error('executor error');
      },
      createNumberPagedResponse,
      (_) => fail(),
      new PagePagination('$request.query#/page')
    )(getRequestBuilder('', undefined), updater(''));

    await expect(async () => collect(pagedData)).rejects.toThrow(
      'executor error'
    );
  });
});
