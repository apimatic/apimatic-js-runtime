import {
  cloneFileWrapper,
  FileWrapper,
  isFileWrapper,
  FileWrapperOptions,
} from '../src/fileWrapper';
import fs from 'fs';
describe('isFileWrapper', () => {
  it('should verify the instance of FileWrapper', () => {
    const fileWrapper = new FileWrapper(fs.createReadStream('dummy_file'));
    expect(isFileWrapper(fileWrapper)).not.toBeFalsy();
  });
  it('should verify the instance of FileWrapper after clonning', () => {
    const options: FileWrapperOptions = {
      contentType: 'optional-content-type',
      filename: 'dummy_file',
    };
    const fileWrapper = new FileWrapper(
      fs.createReadStream('dummy_file'),
      options
    );
    expect(cloneFileWrapper(fileWrapper)).not.toBeFalsy();
  });
});
