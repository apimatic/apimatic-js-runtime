import {
  HttpClientInterface,
  HttpRequest,
  HttpResponse,
} from '@apimatic/core-interfaces';
import { toBuffer, getStreamData } from '../src';
import { convertToStream } from '@apimatic/convert-to-stream';

describe('Tests for getting and comparing stream or blob data as buffer', () => {
  let actualBlobBuffer: Buffer;
  let actualStreamBuffer: Buffer;

  beforeEach(async () => {
    actualBlobBuffer = await toBuffer(
      await getStreamData(mockHttpClientInterface, 'example/getBlob')
    );
    actualStreamBuffer = await toBuffer(
      await getStreamData(mockHttpClientInterface, 'example/getStream')
    );
  });

  it('should throw error for invalid stream data', async () => {
    await expect(
      getStreamData(mockHttpClientInterface, 'invalid/stream')
    ).rejects.toThrow('Unable to retrieve streaming data from invalid/stream');
  });

  it('should throw error for invalid buffer conversion', async () => {
    await expect(toBuffer(undefined)).rejects.toThrow(
      'Unsupported input type. Expected a Blob or ReadableStream.'
    );
  });

  it('should pass with same blob data', async () => {
    const expected = await toBuffer(
      new Blob(['This is example data'], {
        type: 'text/plain;charset=utf-8',
      })
    );

    expect(actualBlobBuffer).toEqual(expected);
    expect(actualStreamBuffer).toEqual(expected);
  });

  it('should pass with same blob data with different types', async () => {
    const expected = await toBuffer(
      new Blob(['This is example data'], {
        type: 'text/plain',
      })
    );

    expect(actualBlobBuffer).toEqual(expected);
    expect(actualStreamBuffer).toEqual(expected);
  });

  it('should fail with different blob data', async () => {
    const expected = await toBuffer(
      new Blob(['different data'], {
        type: 'text/plain;charset=utf-8',
      })
    );

    expect(actualBlobBuffer).not.toEqual(expected);
    expect(actualStreamBuffer).not.toEqual(expected);
  });

  it('should pass with same stream data', async () => {
    const expected = await toBuffer(convertToStream('This is example data'));

    expect(actualBlobBuffer).toEqual(expected);
    expect(actualStreamBuffer).toEqual(expected);
  });

  it('should fail with different stream data', async () => {
    const expected = await toBuffer(convertToStream('different data'));

    expect(actualBlobBuffer).not.toEqual(expected);
    expect(actualStreamBuffer).not.toEqual(expected);
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
      body: convertToStream('This is example data'),
      headers: {},
    });
  }

  return Promise.resolve({
    statusCode: 200,
    body: 'Invalid response as string',
    headers: {},
  });
};
