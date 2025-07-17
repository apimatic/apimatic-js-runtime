import {
  createCursorPagedResponse,
  createLinkPagedResponse,
  createNumberPagedResponse,
  createOffsetPagedResponse,
  PagedResponse,
} from '../src';

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

test.each([
  [
    'createOffsetPagedResponse should throw error for basePagedResponse',
    createOffsetPagedResponse,
    basePagedResponse,
    'Unable to create instance of OffsetPagedResponse',
  ],
  [
    'createOffsetPagedResponse should throw error for null response',
    createOffsetPagedResponse,
    null,
    'Unable to create instance of OffsetPagedResponse',
  ],
  [
    'createCursorPagedResponse should throw error for basePagedResponse',
    createCursorPagedResponse,
    basePagedResponse,
    'Unable to create instance of CursorPagedResponse',
  ],
  [
    'createCursorPagedResponse should throw error for null response',
    createCursorPagedResponse,
    null,
    'Unable to create instance of CursorPagedResponse',
  ],
  [
    'createLinkPagedResponse should throw error for basePagedResponse',
    createLinkPagedResponse,
    basePagedResponse,
    'Unable to create instance of LinkPagedResponse',
  ],
  [
    'createLinkPagedResponse should throw error for null response',
    createLinkPagedResponse,
    null,
    'Unable to create instance of LinkPagedResponse',
  ],
  [
    'createNumberPagedResponse should throw error for basePagedResponse',
    createNumberPagedResponse,
    basePagedResponse,
    'Unable to create instance of NumberPagedResponse',
  ],
  [
    'createNumberPagedResponse should throw error for null response',
    createNumberPagedResponse,
    null,
    'Unable to create instance of NumberPagedResponse',
  ],
])(
  '%s',
  (
    _: string,
    creator: (
      response: PagedResponse<any, any> | null
    ) => PagedResponse<any, any>,
    response: PagedResponse<any, any> | null,
    errorMessage: string
  ) => {
    expect(() => creator(response)).toThrow(errorMessage);
  }
);
