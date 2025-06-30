import { ParameterContext, ParameterUpdater } from './parameterUpdater';
import { updateValueByJsonPointer } from '../../apiHelper';

export class RequestQueryUpdater implements ParameterUpdater {
  public update(
    context: ParameterContext,
    pointer: string,
    setter: (value: any) => any
  ) {
    updateValueByJsonPointer(context.queryParams, pointer, setter);
  }
}
