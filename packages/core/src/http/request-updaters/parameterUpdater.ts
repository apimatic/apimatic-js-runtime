import { RequestBodyUpdater } from './requestBodyUpdater';
import { RequestPathUpdater } from './requestPathUpdater';
import { RequestQueryUpdater } from './requestQueryUpdater';
import { RequestHeadersUpdater } from './requestHeadersUpdater';
import { PathTemplateTypes } from '../pathTemplate';
import { NullParameterUpdater } from './nullParameterUpdater';

export interface ParameterContext {
  queryParams: Record<string, unknown>;
  pathArgs: PathTemplateTypes[] | undefined;
  setBody: (body: any) => void;
  getBody: () => any;
  form: Record<string, PathTemplateTypes> | undefined;
  formData: Record<string, PathTemplateTypes> | undefined;
  headers: Record<string, string>;
}

export interface ParameterUpdater {
  update(
    context: ParameterContext,
    pointer: string,
    setter: (value: any) => any
  ): void;
}

export class ParameterUpdateStrategyFactory {
  private static readonly nullStrategy = new NullParameterUpdater();

  private static readonly strategies = new Map<string, ParameterUpdater>([
    ['$request.body', new RequestBodyUpdater()],
    ['$request.path', new RequestPathUpdater()],
    ['$request.query', new RequestQueryUpdater()],
    ['$request.headers', new RequestHeadersUpdater()],
  ]);

  public static getStrategy(prefix: string): ParameterUpdater {
    return this.strategies.get(prefix) || this.nullStrategy;
  }
}
