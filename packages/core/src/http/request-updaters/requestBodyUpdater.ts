import { ParameterContext, ParameterUpdater } from './parameterUpdater';
import { updateValueByJsonPointer } from '../../apiHelper';

export class RequestBodyUpdater implements ParameterUpdater {
  public update(
    context: ParameterContext,
    pointer: string,
    setter: (value: any) => any
  ) {
    if (context.getBody()) {
      if (pointer === '') {
        context.setBody(setter(context.getBody()));
        return;
      }
      updateValueByJsonPointer(context.getBody(), pointer, setter);
      return;
    }
    if (context.form) {
      updateValueByJsonPointer(context.form, pointer, setter);
      return;
    }
    updateValueByJsonPointer(context.formData, pointer, setter);
  }
}
