import { DefaultRequestBuilder } from '../../src/http/requestBuilder';
import { PagePagination } from '../../src/paginator/pagePagination';
import { OffsetPagination } from '../../src/paginator/offsetPagination';
import { LinkPagination } from '../../src/paginator/linkPagination';
import { createNumberPagedResponse } from '../../src/paginator/numberPagedResponse';
import { createOffsetPagedResponse } from '../../src/paginator/offsetPagedResponse';
import { createLinkPagedResponse } from '../../src/paginator/linkPagedResponse';
import { Schema } from '../../src/schema';
import {
  ApiResponse,
  HttpRequest,
  HttpClientInterface,
  HttpMethod,
} from '../../src/coreInterfaces';
import { createRequestBuilderFactory } from '../../src/http/requestBuilder';
import { ApiError } from '../../src/errors/apiError';
import { passThroughInterceptor } from '../../src/coreInterfaces';
import { RetryConfiguration } from '../../src/coreInterfaces';
import { object, array, string } from '@apimatic/schema';
import { CursorPagination } from '../../src/paginator/cursorPagination';
import { createCursorPagedResponse } from '../../src/paginator/cursorPagedResponse';
import { Pagination } from '../../src/paginator/pagination';
import { PagedResponse } from '../../src/paginator/pagedResponse';

describe('PagedData', () => {
  let mockSchema: Schema<any>;
  let mockGetData: jest.Mock;

  const mockResponses = {
    page1: {
      statusCode: 200,
      body: JSON.stringify({
        data: ['item1', 'item2'],
        nextLink:
          'https://apimatic.hopto.org:3000/test/pagination?nextLink=page2',
        nextCursor: 'cursor2',
      }),
      headers: {},
    },
    page2: {
      statusCode: 200,
      body: JSON.stringify({
        data: ['item3', 'item4'],
        nextLink:
          'https://apimatic.hopto.org:3000/test/pagination?nextLink=page3',
        nextCursor: 'cursor3',
      }),
      headers: {},
    },
    page3: {
      statusCode: 200,
      body: JSON.stringify({
        data: ['item5', 'item6'],
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
    paginationType: 'page' | 'offset' | 'link' | 'cursor' | null
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
          const cursor = params.get('cursor') || '';
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
    paginationType: 'page' | 'offset' | 'link' | 'cursor' | null
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
    paginationType: 'page' | 'offset' | 'link' | 'cursor' | null,
    pagination: Pagination<string, boolean, any, any>,
    pageResponseCreator: (response: PagedResponse<any, any>) => any
  ) {
    const requestBuilder = getRequestBuilder(paginationType);
    requestBuilder.query('page', 1);
    requestBuilder.query('offset', '0');
    requestBuilder.query('cursor', 'cursor1');

    return requestBuilder.paginate(
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
    it('should iterate through pages correctly', async () => {
      const pagedData = getPagedData(
        'page',
        new PagePagination<string, boolean, any, any>('$request.query#/page'),
        createNumberPagedResponse
      );

      const items: any[] = [];
      for await (const item of pagedData) {
        items.push(item);
      }

      expect(items).toEqual([
        'item1',
        'item2',
        'item3',
        'item4',
        'item5',
        'item6',
      ]);
    });

    it('should iterate through pages as pages', async () => {
      const pagedData = getPagedData(
        'page',
        new PagePagination<string, boolean, any, any>('$request.query#/page'),
        createNumberPagedResponse
      );

      const pages: any[][] = [];
      for await (const page of pagedData.pages()) {
        pages.push(page.items);
      }

      expect(pages).toEqual([
        ['item1', 'item2'],
        ['item3', 'item4'],
        ['item5', 'item6'],
      ]);
    });
  });

  describe('Offset-based pagination', () => {
    it('should iterate through pages using offset', async () => {
      const pagedData = getPagedData(
        'offset',
        new OffsetPagination<string, boolean, any, any>(
          '$request.query#/offset'
        ),
        createOffsetPagedResponse
      );

      const items: any[] = [];
      for await (const item of pagedData) {
        items.push(item);
      }

      expect(items).toEqual([
        'item1',
        'item2',
        'item3',
        'item4',
        'item5',
        'item6',
      ]);
    });

    it('should iterate through pages as pages using offset', async () => {
      const pagedData = getPagedData(
        'offset',
        new OffsetPagination<string, boolean, any, any>(
          '$request.query#/offset'
        ),
        createOffsetPagedResponse
      );

      const pages: any[][] = [];
      for await (const page of pagedData.pages()) {
        pages.push(page.items);
      }

      expect(pages).toEqual([
        ['item1', 'item2'],
        ['item3', 'item4'],
        ['item5', 'item6'],
      ]);
    });
  });

  describe('Link-based pagination', () => {
    it('should iterate through pages using next links', async () => {
      const pagedData = getPagedData(
        'link',
        new LinkPagination<string, boolean, any, any>(
          '$response.body#/nextLink'
        ),
        createLinkPagedResponse
      );

      const items: any[] = [];
      for await (const item of pagedData) {
        items.push(item);
      }

      expect(items).toEqual([
        'item1',
        'item2',
        'item3',
        'item4',
        'item5',
        'item6',
      ]);
    });

    it('should iterate through pages as pages using next links', async () => {
      const pagedData = getPagedData(
        'link',
        new LinkPagination<string, boolean, any, any>(
          '$response.body#/nextLink'
        ),
        createLinkPagedResponse
      );

      const pages: Array<{ items: any[]; nextLink: string | null }> = [];
      for await (const page of pagedData.pages()) {
        pages.push({
          items: page.items,
          nextLink: page.nextLink,
        });
      }

      expect(pages).toEqual([
        {
          items: ['item1', 'item2'],
          nextLink: null,
        },
        {
          items: ['item3', 'item4'],
          nextLink:
            'https://apimatic.hopto.org:3000/test/pagination?nextLink=page2',
        },
        {
          items: ['item5', 'item6'],
          nextLink:
            'https://apimatic.hopto.org:3000/test/pagination?nextLink=page3',
        },
      ]);
    });
  });

  describe('Cursor-based pagination', () => {
    it('should iterate through pages using cursor', async () => {
      const pagedData = getPagedData(
        'cursor',
        new CursorPagination<string, boolean, any, any>(
          '$request.query#/cursor',
          '$response.body#/nextCursor'
        ),
        createCursorPagedResponse
      );

      const items: any[] = [];
      for await (const item of pagedData) {
        items.push(item);
      }

      expect(items).toEqual([
        'item1',
        'item2',
        'item3',
        'item4',
        'item5',
        'item6',
      ]);
    });

    it('should iterate through pages as pages using cursor', async () => {
      const pagedData = getPagedData(
        'cursor',
        new CursorPagination<string, boolean, any, any>(
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

      expect(pages).toEqual([
        {
          items: ['item1', 'item2'],
          nextCursor: null,
        },
        {
          items: ['item3', 'item4'],
          nextCursor: 'cursor2',
        },
        {
          items: ['item5', 'item6'],
          nextCursor: 'cursor3',
        },
      ]);
    });
  });

  describe('Error handling', () => {
    it('should handle none paginationStrategies in arguments', async () => {
      const requestBuilder = getRequestBuilder(null);
      requestBuilder.query('page', 1);
      requestBuilder.query('offset', '0');
      requestBuilder.query('cursor', 'cursor1');

      const pagedData = requestBuilder.paginate(
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

      const pagedData = getPagedData(
        'page',
        new PagePagination<string, boolean, any, any>('$request.query#/page'),
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

      const pagedData = defaultRequestBuilder.paginate(
        mockSchema,
        undefined,
        createNumberPagedResponse,
        mockGetData,
        new PagePagination<string, boolean, any, any>('$request.query#/page')
      );

      await expect(async () => {
        const items: any[] = [];
        for await (const item of pagedData) {
          items.push(item);
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
