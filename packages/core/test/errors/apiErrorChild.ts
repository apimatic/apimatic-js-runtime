import { ApiError } from '../../src';

export class ApiErrorChild extends ApiError<{ key: string }> {}
