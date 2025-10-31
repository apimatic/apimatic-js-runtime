import { isFormDataWrapper, createFormData } from '../src/formDataWrapper';

describe('formDataWrapper', () => {
  describe('createFormData', () => {
    it('should create a FormDataWrapper with data only', () => {
      const testData = { key: 'value' };
      const result = createFormData(testData);

      expect(result.data).toBe(testData);
      expect(result.headers).toBeUndefined();
      expect(typeof result).toBe('object');
    });

    it('should create a FormDataWrapper with data and headers', () => {
      const testData = 'test string data';
      const testHeaders = {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token',
      };
      const result = createFormData(testData, testHeaders);

      expect(result.data).toBe(testData);
      expect(result.headers).toBe(testHeaders);
      expect(typeof result).toBe('object');
    });

    it('should create a FormDataWrapper with null data', () => {
      const result = createFormData(null);

      expect(result.data).toBeNull();
      expect(result.headers).toBeUndefined();
      expect(typeof result).toBe('object');
    });

    it('should create a FormDataWrapper with undefined data', () => {
      const result = createFormData(undefined);

      expect(result.data).toBeUndefined();
      expect(result.headers).toBeUndefined();
      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('data', undefined);
    });

    it('should create a FormDataWrapper with empty headers object', () => {
      const testData = [1, 2, 3];
      const emptyHeaders = {};
      const result = createFormData(testData, emptyHeaders);

      expect(result.data).toBe(testData);
      expect(result.headers).toBe(emptyHeaders);
      expect(typeof result).toBe('object');
    });

    it('should create a FormDataWrapper with number data', () => {
      const numberData = 42;
      const result = createFormData(numberData);

      expect(result.data).toBe(numberData);
      expect(result.headers).toBeUndefined();
      expect(typeof result).toBe('object');
    });

    it('should create a FormDataWrapper with array data', () => {
      const arrayData = ['item1', 'item2', 'item3'];
      const headers = { 'X-Custom-Header': 'value' };
      const result = createFormData(arrayData, headers);

      expect(result.data).toBe(arrayData);
      expect(result.headers).toBe(headers);
      expect(typeof result).toBe('object');
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
      expect(isFormDataWrapper(formData)).toBe(true);
    });

    it('should return true for a FormDataWrapper with undefined data', () => {
      const formData = createFormData(undefined);
      expect(isFormDataWrapper(formData)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isFormDataWrapper(null)).toBe(false);
    });

    it('should return false for unrelated objects', () => {
      expect(isFormDataWrapper({ success: false, error: 'err' })).toBe(false);
      expect(isFormDataWrapper(null)).toBe(false);
      expect(isFormDataWrapper(undefined)).toBe(false);
      expect(isFormDataWrapper('string')).toBe(false);
    });
  });
});
