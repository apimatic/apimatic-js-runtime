import {
  ApiError,
  CursorPagination,
  PagedData,
  createCursorPagedResponse,
  createNumberPagedResponse,
  createOffsetPagedResponse,
  createLinkPagedResponse,
  createRequestBuilderFactory,
  DefaultRequestBuilder,
  PagePagination,
  OffsetPagination,
  PagedResponse,
  LinkPagination,
} from '../../src';
import { Schema } from '../../src/schema';
import {
  ApiResponse,
  HttpRequest,
  HttpClientInterface,
  HttpMethod,
  passThroughInterceptor,
  RetryConfiguration,
} from '../../src/coreInterfaces';
import { object, array, string } from '@apimatic/schema';
import { PaginationStrategy } from '../../src/paginator/paginationStrategy';

type PaginationType = 'page' | 'offset' | 'link' | 'cursor' | null;

describe('PagedData', () => {
  let mockSchema: Schema<any>;
  let mockGetData: jest.Mock;

  const expectedPages = [
    ['item1', 'item2'],
    ['item3', 'item4'],
    ['item5', 'item6'],
  ];
  const expectedItems = expectedPages.reduce(
    (acc, curr) => acc.concat(curr),
    []
  );

  const mockResponses = {
    page1: {
      statusCode: 200,
      body: JSON.stringify({
        data: expectedPages[0],
        nextLink:
          'https://apimatic.hopto.org:3000/test/pagination?nextLink=page2',
        nextCursor: 'cursor2',
      }),
      headers: {},
    },
    page2: {
      statusCode: 200,
      body: JSON.stringify({
        data: expectedPages[1],
        nextLink:
          'https://apimatic.hopto.org:3000/test/pagination?nextLink=page3',
        nextCursor: 'cursor3',
      }),
      headers: {},
    },
    page3: {
      statusCode: 200,
      body: JSON.stringify({
        data: expectedPages[2],
        nextLink: null,
        nextCursor: 'cursor4',
      }),
      headers: {},
    },
    empty: {
      statusCode: 200,
      body: JSON.stringify({ data: [], nextCursor: null }),
      headers: {},
    },
    error: {
      statusCode: 400,
      body: JSON.stringify({ error: 'Bad Request' }),
      headers: {},
    },
    noData: {
      statusCode: 200,
      body: JSON.stringify({}),
      headers: {},
    },
  };

  function createMockHttpClient(
    paginationType: PaginationType
  ): HttpClientInterface {
    return async (request: HttpRequest) => {
      const queryString = request.url.split('?')[1] || '';
      const params = new URLSearchParams(queryString);

      switch (paginationType) {
        case 'page': {
          const page = parseInt(params.get('page') || '1', 10);
          const pageMap: Record<number, keyof typeof mockResponses> = {
            1: 'page1',
            2: 'page2',
            3: 'page3',
          };
          return mockResponses[pageMap[page]] || mockResponses.empty;
        }

        case 'offset': {
          const offset = parseInt(params.get('offset') || '0', 10);
          const offsetMap: Record<number, keyof typeof mockResponses> = {
            0: 'page1',
            2: 'page2',
            4: 'page3',
          };
          return mockResponses[offsetMap[offset]] || mockResponses.empty;
        }

        case 'link': {
          const nextLink = params.get('nextLink');
          const linkMap: Record<string, keyof typeof mockResponses> = {
            page2: 'page2',
            page3: 'page3',
          };
          return nextLink
            ? mockResponses[linkMap[nextLink]] || mockResponses.empty
            : mockResponses.page1;
        }

        case 'cursor': {
          const cursor = params.get('cursor') || 'cursor1';
          if (cursor === 'cursor1') {
            return mockResponses.page1;
          } else if (cursor === 'cursor2') {
            return mockResponses.page2;
          } else if (cursor === 'cursor3') {
            return mockResponses.page3;
          } else {
            return mockResponses.empty;
          }
        }

        default:
          return mockResponses.empty;
      }
    };
  }

  function mockBaseURIProvider() {
    return 'https://apimatic.hopto.org:3000';
  }
  const noneAuthenticationProvider = () => passThroughInterceptor;
  const retryConfig: RetryConfiguration = {
    maxNumberOfRetries: 3,
    retryOnTimeout: false,
    retryInterval: 1,
    maximumRetryWaitTime: 3,
    backoffFactor: 2,
    httpStatusCodesToRetry: [408, 413, 429, 500, 502, 503, 504, 521, 522, 524],
    httpMethodsToRetry: ['GET', 'PUT'] as HttpMethod[],
  };

  function getRequestBuilder(
    paginationType: PaginationType
  ): DefaultRequestBuilder<string, boolean> {
    const defaultRequestBuilder = createRequestBuilderFactory<string, boolean>(
      createMockHttpClient(paginationType),
      mockBaseURIProvider,
      ApiError,
      noneAuthenticationProvider,
      retryConfig
    ) as (
      httpMethod: HttpMethod,
      path?: string
    ) => DefaultRequestBuilder<string, boolean>;

    const requestBuilder = defaultRequestBuilder('GET', '/test/pagination');
    requestBuilder.baseUrl('default');

    return requestBuilder;
  }

  function getPagedData(
    requestBuilder: DefaultRequestBuilder<string, any>,
    pagination: PaginationStrategy,
    pageResponseCreator: (response: PagedResponse<any, any>) => any
  ) {
    return new PagedData(
      requestBuilder,
      mockSchema,
      undefined,
      pageResponseCreator,
      mockGetData,
      pagination
    );
  }

  beforeEach(() => {
    mockSchema = object({
      data: ['data', array(string())],
    });
    mockGetData = jest.fn((response: ApiResponse<any>) => {
      const body = JSON.parse(response.body as string);
      return body.data;
    });
  });

  describe('Page-based pagination', () => {
    const expectedNumberPages = expectedPages.map((items, index) => ({
      items,
      pageNumber: `${index + 1}`,
    }));

    it('should iterate through pages correctly', async () => {
      const requestBuilder = getRequestBuilder('page');
      requestBuilder.query('page', 1);
      const pagedData = getPagedData(
        requestBuilder,
        new PagePagination('$request.query#/page'),
        createNumberPagedResponse
      );

      const items: any[] = [];
      for await (const item of pagedData) {
        items.push(item);
      }

      expect(items).toEqual(expectedItems);
    });

    it('should iterate through pages as pages', async () => {
      const requestBuilder = getRequestBuilder('page');
      requestBuilder.query('page', 1);
      const pagedData = getPagedData(
        requestBuilder,
        new PagePagination('$request.query#/page'),
        createNumberPagedResponse
      );

      const pages: Array<{ items: any[]; pageNumber: string }> = [];
      for await (const page of pagedData.pages()) {
        pages.push({
          items: page.items,
          pageNumber: page.pageNumber,
        });
      }

      expect(pages).toEqual(expectedNumberPages);
    });

    it('should use 1 as pageNumber when it is undefined', async () => {
      const requestBuilder = getRequestBuilder('page');
      requestBuilder.query('page', undefined);
      const pagedData = getPagedData(
        requestBuilder,
        new PagePagination('$request.query#/page'),
        createNumberPagedResponse
      );

      const pages: Array<{ items: any[]; pageNumber: string }> = [];
      for await (const page of pagedData.pages()) {
        pages.push({
          items: page.items,
          pageNumber: page.pageNumber,
        });
      }

      expect(pages).toEqual(expectedNumberPages);
    });

    it('should start iteration from 2nd page when pageNumber is 2', async () => {
      const requestBuilder = getRequestBuilder('page');
      requestBuilder.query('page', 2);
      const pagedData = getPagedData(
        requestBuilder,
        new PagePagination('$request.query#/page'),
        createNumberPagedResponse
      );

      const pages: Array<{ items: any[]; pageNumber: string }> = [];
      for await (const page of pagedData.pages()) {
        pages.push({
          items: page.items,
          pageNumber: page.pageNumber,
        });
      }

      expect(pages).toEqual(expectedNumberPages.slice(-2));
    });
  });

  describe('Offset-based pagination', () => {
    const expectedOffsetPages = expectedPages.map((items, index) => ({
      items,
      offset: `${index * 2}`,
    }));

    it('should iterate through pages using offset', async () => {
      const requestBuilder = getRequestBuilder('offset');
      requestBuilder.query('offset', 0);
      const pagedData = getPagedData(
        requestBuilder,
        new OffsetPagination('$request.query#/offset'),
        createOffsetPagedResponse
      );

      const items: any[] = [];
      for await (const item of pagedData) {
        items.push(item);
      }

      expect(items).toEqual(expectedItems);
    });

    it('should iterate through pages as pages using offset', async () => {
      const requestBuilder = getRequestBuilder('offset');
      requestBuilder.query('offset', 0);
      const pagedData = getPagedData(
        requestBuilder,
        new OffsetPagination('$request.query#/offset'),
        createOffsetPagedResponse
      );

      const pages: Array<{ items: any[]; offset: string }> = [];
      for await (const page of pagedData.pages()) {
        pages.push({
          items: page.items,
          offset: page.offset,
        });
      }

      expect(pages).toEqual(expectedOffsetPages);
    });

    it('should use 0 as offset when it is undefined', async () => {
      const requestBuilder = getRequestBuilder('offset');
      requestBuilder.query('offset', undefined);
      const pagedData = getPagedData(
        requestBuilder,
        new OffsetPagination('$request.query#/offset'),
        createOffsetPagedResponse
      );

      const pages: Array<{ items: any[]; offset: string }> = [];
      for await (const page of pagedData.pages()) {
        pages.push({
          items: page.items,
          offset: page.offset,
        });
      }

      expect(pages).toEqual(expectedOffsetPages);
    });

    it('should start iteration from 2nd item when offset is 2', async () => {
      const requestBuilder = getRequestBuilder('offset');
      requestBuilder.query('offset', 2);
      const pagedData = getPagedData(
        requestBuilder,
        new OffsetPagination('$request.query#/offset'),
        createOffsetPagedResponse
      );

      const pages: Array<{ items: any[]; offset: string }> = [];
      for await (const page of pagedData.pages()) {
        pages.push({
          items: page.items,
          offset: page.offset,
        });
      }

      expect(pages).toEqual(expectedOffsetPages.slice(-2));
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

    it('should iterate through pages using next links', async () => {
      const requestBuilder = getRequestBuilder('link');
      requestBuilder.query('page', 1);
      const pagedData = getPagedData(
        requestBuilder,
        new LinkPagination('$response.body#/nextLink'),
        createLinkPagedResponse
      );

      const items: any[] = [];
      for await (const item of pagedData) {
        items.push(item);
      }

      expect(items).toEqual(expectedItems);
    });

    it('should iterate through pages as pages using next links', async () => {
      const requestBuilder = getRequestBuilder('link');
      requestBuilder.query('page', 1);
      const pagedData = getPagedData(
        requestBuilder,
        new LinkPagination('$response.body#/nextLink'),
        createLinkPagedResponse
      );

      const pages: Array<{ items: any[]; nextLink: string | null }> = [];
      for await (const page of pagedData.pages()) {
        pages.push({
          items: page.items,
          nextLink: page.nextLink,
        });
      }

      expect(pages).toEqual(expectedLinkPages);
    });
  });

  describe('Cursor-based pagination', () => {
    const expectedCursorPages = expectedPages.map((items, index) => ({
      items,
      nextCursor: `cursor${index + 1}`,
    }));

    it('should iterate through pages using cursor', async () => {
      const requestBuilder = getRequestBuilder('cursor');
      requestBuilder.query('cursor', 'cursor1');
      const pagedData = getPagedData(
        requestBuilder,
        new CursorPagination(
          '$request.query#/cursor',
          '$response.body#/nextCursor'
        ),
        createCursorPagedResponse
      );

      const items: any[] = [];
      for await (const item of pagedData) {
        items.push(item);
      }

      expect(items).toEqual(expectedItems);
    });

    it('should iterate through pages as pages using cursor', async () => {
      const requestBuilder = getRequestBuilder('cursor');
      requestBuilder.query('cursor', 'cursor1');
      const pagedData = getPagedData(
        requestBuilder,
        new CursorPagination(
          '$request.query#/cursor',
          '$response.body#/nextCursor'
        ),
        createCursorPagedResponse
      );

      const pages: Array<{ items: any[]; nextCursor: string | null }> = [];
      for await (const page of pagedData.pages()) {
        pages.push({
          items: page.items,
          nextCursor: page.nextCursor,
        });
      }

      expect(pages).toEqual(expectedCursorPages);
    });

    it('should return null cursor for 1st page when cursor is undefined', async () => {
      const requestBuilder = getRequestBuilder('cursor');
      requestBuilder.query('cursor', undefined);
      const pagedData = getPagedData(
        requestBuilder,
        new CursorPagination(
          '$request.query#/cursor',
          '$response.body#/nextCursor'
        ),
        createCursorPagedResponse
      );

      const pages: Array<{ items: any[]; nextCursor: string | null }> = [];
      for await (const page of pagedData.pages()) {
        pages.push({
          items: page.items,
          nextCursor: page.nextCursor,
        });
      }
      const modifiedExpectedCursorPages = expectedCursorPages.map(
        (page, index) => ({
          ...page,
          nextCursor: index === 0 ? null : page.nextCursor,
        })
      );

      expect(pages).toEqual(modifiedExpectedCursorPages);
    });

    it('should return 1st page only as nextCursor pointer is invalid', async () => {
      const requestBuilder = getRequestBuilder('cursor');
      requestBuilder.query('cursor', 'cursor1');
      const pagedData = getPagedData(
        requestBuilder,
        new CursorPagination(
          '$request.query#/cursor',
          '$response.body#/next-Cursor'
        ),
        createCursorPagedResponse
      );

      const pages: Array<{ items: any[]; nextCursor: string | null }> = [];
      for await (const page of pagedData.pages()) {
        pages.push({
          items: page.items,
          nextCursor: page.nextCursor,
        });
      }

      expect(pages).toEqual(expectedCursorPages.slice(0, 1));
    });
  });

  describe('Error handling', () => {
    it('should handle none paginationStrategies in arguments', async () => {
      const requestBuilder = getRequestBuilder(null);
      requestBuilder.query('page', 1);
      requestBuilder.query('offset', '0');
      requestBuilder.query('cursor', 'cursor1');

      const pagedData = new PagedData(
        requestBuilder,
        mockSchema,
        undefined,
        (p) => p,
        mockGetData
      );

      const items: any[] = [];
      for await (const item of pagedData) {
        items.push(item);
      }

      expect(items).toEqual([]);
    });

    it('should handle undefined data from getData', async () => {
      const originalGetData = mockGetData;
      mockGetData = jest.fn(() => undefined);

      const requestBuiler = getRequestBuilder(null);
      const pagedData = getPagedData(
        requestBuiler,
        new PagePagination('$request.query#/page'),
        createNumberPagedResponse
      );

      const items: any[] = [];
      for await (const item of pagedData) {
        items.push(item);
      }

      expect(items).toEqual([]);

      mockGetData = originalGetData;
    });

    it('should handle 400 status code from callAsJson', async () => {
      const errorHttpClient: HttpClientInterface = async () => ({
        statusCode: 400,
        body: JSON.stringify({ error: 'Bad Request' }),
        headers: {},
      });

      const defaultRequestBuilder = createRequestBuilderFactory<
        string,
        boolean
      >(
        errorHttpClient,
        mockBaseURIProvider,
        ApiError,
        noneAuthenticationProvider,
        retryConfig
      )('GET', '/test/pagination');

      defaultRequestBuilder.baseUrl('default');
      defaultRequestBuilder.query('page', 1);

      const pagedData = new PagedData(
        defaultRequestBuilder,
        mockSchema,
        undefined,
        createNumberPagedResponse,
        mockGetData,
        new PagePagination('$request.query#/page')
      );

      await expect(async () => {
        for await (const _ of pagedData) {
          // iterating to trigger the error condition
        }
      }).rejects.toThrow();
    });
  });
});

describe('Paged Response Creator Functions', () => {
  const basePagedResponse: PagedResponse<any, any> = {
    request: {
      method: 'GET',
      url: 'https://example.com',
      headers: {},
    },
    statusCode: 200,
    headers: {},
    body: '{}',
    result: {},
    items: [],
  };

  it('createOffsetPagedResponse should return undefined for non-offset paged response', () => {
    const result = createOffsetPagedResponse(basePagedResponse);
    expect(result).toBeUndefined();
  });

  it('createNumberPagedResponse should return undefined for non-number paged response', () => {
    const result = createNumberPagedResponse(basePagedResponse);
    expect(result).toBeUndefined();
  });

  it('createLinkPagedResponse should return undefined for non-link paged response', () => {
    const result = createLinkPagedResponse(basePagedResponse);
    expect(result).toBeUndefined();
  });

  it('createCursorPagedResponse should return undefined for non-cursor paged response', () => {
    const result = createCursorPagedResponse(basePagedResponse);
    expect(result).toBeUndefined();
  });
});
