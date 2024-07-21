import {
  HttpClientInterface,
  HttpRequest,
  HttpResponse,
} from '@apimatic/core-interfaces';
import { areStreamsMatching, getStreamData } from '../src';
import { Readable } from 'stream';

describe('areStreamsMatching with getStreamData', () => {
  let actualBlob;
  let actualStream;

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

  it('should pass with same data', async () => {
    const expected = new Blob(['This is example data'], {
      type: 'text/plain;charset=utf-8',
    });

    expect(await areStreamsMatching(expected, actualBlob)).toBeTruthy();
    expect(await areStreamsMatching(expected, actualStream)).toBeTruthy();
  });

  it('should pass with same data and different types', async () => {
    const expected = new Blob(['This is example data'], {
      type: 'text/plain',
    });

    expect(await areStreamsMatching(expected, actualBlob)).toBeTruthy();
    expect(await areStreamsMatching(expected, actualStream)).toBeTruthy();
  });

  it('should fail with different data', async () => {
    const expected = new Blob(['different data'], {
      type: 'text/plain;charset=utf-8',
    });

    expect(await areStreamsMatching(expected, actualBlob)).not.toBeTruthy();
    expect(await areStreamsMatching(expected, actualStream)).not.toBeTruthy();
  });

  it('should fail when actual value is undefined', async () => {
    const expected = new Blob(['different data'], {
      type: 'text/plain;charset=utf-8',
    });

    expect(await areStreamsMatching(expected, undefined)).not.toBeTruthy();
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
