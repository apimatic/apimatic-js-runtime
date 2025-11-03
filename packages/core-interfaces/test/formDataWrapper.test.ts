import { isFormDataWrapper, createFormData } from '../src/formDataWrapper';

describe('formDataWrapper', () => {
  describe('createFormData', () => {
    it('should create a FormDataWrapper with object data converted to JSON string', () => {
      const testData = { key: 'value' };
      const result = createFormData(testData);

      expect(result).toBeDefined();
      expect(result!.data).toBe('{"key":"value"}');
      expect(result!.headers).toBeUndefined();
      expect(typeof result).toBe('object');
    });

    it('should create a FormDataWrapper with string data (no conversion)', () => {
      const testData = 'test string data';
      const testHeaders = {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token',
      };
      const result = createFormData(testData, testHeaders);

      expect(result).toBeDefined();
      expect(result!.data).toBe(testData);
      expect(result!.headers).toBe(testHeaders);
      expect(typeof result).toBe('object');
    });

    it('should create a FormDataWrapper with null data converted to JSON string', () => {
      const result = createFormData(null);

      expect(result).toBeUndefined();
    });

    it('should create a FormDataWrapper with undefined data', () => {
      const result = createFormData(undefined);

      expect(result).toBeUndefined();
    });

    it('should create a FormDataWrapper with array data converted to JSON string', () => {
      const testData = [1, 2, 3];
      const emptyHeaders = {};
      const result = createFormData(testData, emptyHeaders);

      expect(result).toBeDefined();
      expect(result!.data).toBe('[1,2,3]');
      expect(result!.headers).toBe(emptyHeaders);
      expect(typeof result).toBe('object');
    });

    it('should create a FormDataWrapper with number data', () => {
      const numberData = 42;
      const result = createFormData(numberData);

      expect(result).toBeDefined();
      expect(result!.data).toBe('42');
      expect(result!.headers).toBeUndefined();
      expect(typeof result).toBe('object');
    });

    it('should create a FormDataWrapper with array data converted to JSON string', () => {
      const arrayData = ['item1', 'item2', 'item3'];
      const headers = { 'X-Custom-Header': 'value' };
      const result = createFormData(arrayData, headers);

      expect(result).toBeDefined();
      expect(result!.data).toBe('["item1","item2","item3"]');
      expect(result!.headers).toBe(headers);
      expect(typeof result).toBe('object');
    });

    it('should create a FormDataWrapper with complex nested object converted to JSON string', () => {
      const complexData = {
        user: { id: 1, name: 'John' },
        items: [
          { type: 'book', price: 10.99 },
          { type: 'pen', price: 1.5 },
        ],
      };
      const result = createFormData(complexData);

      expect(result).toBeDefined();
      expect(result!.data).toBe(
        '{"user":{"id":1,"name":"John"},"items":[{"type":"book","price":10.99},{"type":"pen","price":1.5}]}'
      );
      expect(result!.headers).toBeUndefined();
    });

    it('should not convert primitive string data to JSON', () => {
      const stringData = 'simple string';
      const result = createFormData(stringData);

      expect(result).toBeDefined();
      expect(result!.data).toBe('simple string');
      expect(result!.headers).toBeUndefined();
    });

    it('should convert boolean data to JSON', () => {
      const booleanData = true;
      const result = createFormData(booleanData);

      expect(result).toBeDefined();
      expect(result!.data).toBe('true');
      expect(result!.headers).toBeUndefined();
    });
  });

  describe('isFormDataWrapper', () => {
    it('should return true for a valid FormDataWrapper object created with createFormData', () => {
      const formData = createFormData({ test: 'data' });
      expect(isFormDataWrapper(formData)).toBe(true);
    });

    it('should return true for a FormDataWrapper with headers', () => {
      const formData = createFormData('test', { 'Content-Type': 'text/plain' });
      expect(isFormDataWrapper(formData)).toBe(true);
    });

    it('should return true for a FormDataWrapper with null data', () => {
      const formData = createFormData(null);
      expect(isFormDataWrapper(formData)).toBe(false);
    });

    it('should return true for a FormDataWrapper with undefined data', () => {
      const formData = createFormData(undefined);
      expect(isFormDataWrapper(formData)).toBe(false);
    });

    it('should return true for a FormDataWrapper with array data', () => {
      const formData = createFormData([1, 2, 3]);
      expect(isFormDataWrapper(formData)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isFormDataWrapper(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isFormDataWrapper(undefined)).toBe(false);
    });

    it('should return false for primitive types', () => {
      expect(isFormDataWrapper('string')).toBe(false);
      expect(isFormDataWrapper(123)).toBe(false);
      expect(isFormDataWrapper(true)).toBe(false);
    });

    it('should return false for arrays', () => {
      expect(isFormDataWrapper([1, 2, 3])).toBe(false);
      expect(isFormDataWrapper([])).toBe(false);
    });
  });
});
