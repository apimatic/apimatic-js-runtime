import {
  cloneFileWrapper,
  FileWrapper,
  isFileWrapper,
} from '../src/fileWrapper';
import fs from 'fs';

describe('FileWrapper.withOptions', () => {
  it('should merge new options with existing options', () => {
    const initialOptions = {
      contentType: 'text/plain',
      filename: 'original.txt',
    };
    const fileWrapper = new FileWrapper(
      fs.createReadStream('test/dummy_file.txt'),
      initialOptions
    );

    const newOptions = {
      contentType: 'application/json',
      headers: { 'X-Custom': 'test-value' },
    };

    const result = fileWrapper.withOptions(newOptions);

    expect(result).toBe(fileWrapper); // Should return the same instance
    expect(fileWrapper.options).toEqual({
      contentType: 'application/json', // Should be overwritten
      filename: 'original.txt', // Should be preserved
      headers: { 'X-Custom': 'test-value' }, // Should be added
    });
  });

  it('should handle FileWrapper with no initial options', () => {
    const fileWrapper = new FileWrapper(
      fs.createReadStream('test/dummy_file.txt')
    );

    const newOptions = {
      contentType: 'image/png',
      filename: 'image.png',
    };

    fileWrapper.withOptions(newOptions);
    expect(fileWrapper.options).toEqual(newOptions);
  });

  it('should handle empty new options object', () => {
    const initialOptions = {
      contentType: 'text/plain',
      filename: 'test.txt',
    };
    const fileWrapper = new FileWrapper(
      fs.createReadStream('test/dummy_file.txt'),
      initialOptions
    );

    fileWrapper.withOptions({});
    expect(fileWrapper.options).toEqual(initialOptions);
  });
});

describe('isFileWrapper', () => {
  it('should verify the instance of FileWrapper', () => {
    const fileWrapper = new FileWrapper(
      fs.createReadStream('test/dummy_file.txt')
    );
    expect(isFileWrapper(cloneFileWrapper(fileWrapper))).not.toBeFalsy();
  });
  it('should verify the instance of FileWrapper after clonning with headers', () => {
    const options = {
      contentType: 'optional-content-type',
      filename: 'dummy_file',
      headers: { 'test header': 'test value' },
    };
    const fileWrapper = new FileWrapper(
      fs.createReadStream('test/dummy_file.txt'),
      options
    );
    expect(isFileWrapper(cloneFileWrapper(fileWrapper))).not.toBeFalsy();
  });
  it('should verify the instance of FileWrapper after clonning without headers', () => {
    const options = {
      contentType: 'optional-content-type',
      filename: 'dummy_file',
    };
    const fileWrapper = new FileWrapper(
      fs.createReadStream('test/dummy_file.txt'),
      options
    );
    expect(isFileWrapper(cloneFileWrapper(fileWrapper))).not.toBeFalsy();
  });
});
