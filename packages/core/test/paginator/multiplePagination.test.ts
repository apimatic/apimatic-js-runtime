import { PagePagination } from '../../src/paginator/pagePagination';
import { LinkPagination } from '../../src/paginator/linkPagination';
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

describe('Multiple Pagination Strategies', () => {
  let mockSchema: Schema<any>;
  let mockGetData: jest.Mock;

  const mockResponses = {
    page1: {
      statusCode: 200,
      body: JSON.stringify({
        data: ['item1', 'item2'],
        nextLink:
          'https://apimatic.hopto.org:3000/test/pagination?nextLink=page2',
      }),
      headers: {},
    },
    page2: {
      statusCode: 200,
      body: JSON.stringify({
        data: ['item3', 'item4'],
        nextLink:
          'https://apimatic.hopto.org:3000/test/pagination?nextLink=page3',
      }),
      headers: {},
    },
    page3: {
      statusCode: 200,
      body: JSON.stringify({
        data: ['item5', 'item6'],
        nextLink: null,
      }),
      headers: {},
    },
    page4: {
      statusCode: 200,
      body: JSON.stringify({
        data: ['item7', 'item8'],
      }),
      headers: {},
    },
    empty: {
      statusCode: 200,
      body: JSON.stringify({ data: [] }),
      headers: {},
    },
  };

  function createMockHttpClient(): HttpClientInterface {
    return async (request: HttpRequest) => {
      const queryString = request.url.split('?')[1] || '';
      const params = new URLSearchParams(queryString);

      // First check for link-based pagination
      const nextLink = params.get('nextLink');
      if (nextLink) {
        const linkMap: Record<string, keyof typeof mockResponses> = {
          page2: 'page2',
          page3: 'page3',
        };
        return mockResponses[linkMap[nextLink]] || mockResponses.empty;
      }

      // Fall back to page-based pagination
      const page = parseInt(params.get('page') || '1', 10);
      const pageMap: Record<number, keyof typeof mockResponses> = {
        1: 'page1',
        2: 'page2',
        3: 'page3',
        4: 'page4',
      };
      return mockResponses[pageMap[page]] || mockResponses.empty;
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

  beforeEach(() => {
    mockSchema = object({
      data: ['data', array(string())],
    });
    mockGetData = jest.fn((response: ApiResponse<any>) => {
      const body = JSON.parse(response.body as string);
      return body.data;
    });
  });

  it('should use link pagination first and then fall back to page pagination', async () => {
    const defaultRequestBuilder = createRequestBuilderFactory<string, boolean>(
      createMockHttpClient(),
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
      createLinkPagedResponse,
      mockGetData,
      new LinkPagination<string, boolean, any, any>('$response.body#/nextLink'),
      new PagePagination<string, boolean, any, any>('$request.query#/page')
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

  it('should iterate through all items correctly with mixed pagination strategies', async () => {
    const defaultRequestBuilder = createRequestBuilderFactory<string, boolean>(
      createMockHttpClient(),
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
      createLinkPagedResponse,
      mockGetData,
      new LinkPagination<string, boolean, any, any>('$response.body#/nextLink'),
      new PagePagination<string, boolean, any, any>('$request.query#/page')
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
});
