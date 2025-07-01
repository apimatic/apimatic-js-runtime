import { ParameterContext, ParameterUpdater } from './parameterUpdater';
import { updateValueByJsonPointer } from '../../apiHelper';

export class RequestHeadersUpdater implements ParameterUpdater {
  public update(
    context: ParameterContext,
    pointer: string,
    setter: (value: any) => any
  ) {
    updateValueByJsonPointer(context.headers, pointer, setter);
  }
}
