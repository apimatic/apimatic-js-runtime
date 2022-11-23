import {
  cloneFileWrapper,
  FileWrapper,
  isFileWrapper,
} from '../src/fileWrapper';
import fs from 'fs';
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
