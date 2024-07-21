import {
  HttpClientInterface,
  HttpRequest,
  HttpResponse,
} from '@apimatic/core-interfaces';
import { expectStreamsMatching, getStreamData } from '../src';
import { Readable } from 'stream';

describe('areStreamsMatching with getStreamData', () => {
  let actualBlob: Blob | NodeJS.ReadableStream | undefined;
  let actualStream: Blob | NodeJS.ReadableStream | undefined;

  beforeEach(async () => {
    actualBlob = await getStreamData(
      mockHttpClientInterface,
      'example/getBlob'
    );
    actualStream = await getStreamData(
      mockHttpClientInterface,
      'example/getStream'
    );
  });

  it('should throw error for invalid stream data', async () => {
    await expect(
      getStreamData(mockHttpClientInterface, 'invalid/stream')
    ).rejects.toThrow('Unable to retrieve streaming data from invalid/stream');
  });

  it('should pass with same blob data', async () => {
    const expected = new Blob(['This is example data'], {
      type: 'text/plain;charset=utf-8',
    });

    await expectStreamsMatching(expected, actualBlob);
    await expectStreamsMatching(expected, actualStream);
  });

  it('should pass with same stream data', async () => {
    await expectStreamsMatching(
      Readable.from('This is example data'),
      actualBlob
    );
    await expectStreamsMatching(
      Readable.from('This is example data'),
      actualStream
    );
  });

  it('should pass with same blob data with different types', async () => {
    const expected = new Blob(['This is example data'], {
      type: 'text/plain',
    });

    await expectStreamsMatching(expected, actualBlob);
    await expectStreamsMatching(expected, actualStream);
  });

  it('should fail with different blob data', async () => {
    const expected = new Blob(['different data'], {
      type: 'text/plain;charset=utf-8',
    });

    await expect(expectStreamsMatching(expected, actualBlob)).rejects.toThrow();
    await expect(
      expectStreamsMatching(expected, actualStream)
    ).rejects.toThrow();
  });

  it('should fail with different stream data', async () => {
    await expect(
      expectStreamsMatching(Readable.from('different data'), actualBlob)
    ).rejects.toThrow();
    await expect(
      expectStreamsMatching(Readable.from('different data'), actualStream)
    ).rejects.toThrow();
  });

  it('should fail when actual value is undefined', async () => {
    const expected = new Blob(['different data'], {
      type: 'text/plain;charset=utf-8',
    });

    await expect(expectStreamsMatching(expected, undefined)).rejects.toThrow();
  });
});

const mockHttpClientInterface: HttpClientInterface = (
  request: HttpRequest,
  _?: any
): Promise<HttpResponse> => {
  if (request.url === 'example/getBlob') {
    return Promise.resolve({
      statusCode: 200,
      body: new Blob(['This is example data'], {
        type: 'text/plain;charset=utf-8',
      }),
      headers: {},
    });
  }

  if (request.url === 'example/getStream') {
    return Promise.resolve({
      statusCode: 200,
      body: Readable.from('This is example data'),
      headers: {},
    });
  }

  return Promise.resolve({
    statusCode: 200,
    body: 'Invalid response as string',
    headers: {},
  });
};
