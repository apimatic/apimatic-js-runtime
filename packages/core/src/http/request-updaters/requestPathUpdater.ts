import { ParameterContext, ParameterUpdater } from './parameterUpdater';
import { updateValueByJsonPointer } from '../../apiHelper';
import { PathParam } from '../pathParam';
import { SkipEncode } from '../pathTemplate';

export class RequestPathUpdater implements ParameterUpdater {
  public update(
    context: ParameterContext,
    pointer: string,
    setter: (value: any) => any
  ) {
    const argsObject: Record<string, unknown> = this.buildArgsObject(context);
    updateValueByJsonPointer(argsObject, pointer, setter);
    this.updatePathArgs(context, argsObject);
  }

  private buildArgsObject(context: ParameterContext): Record<string, unknown> {
    const argsObject: Record<string, unknown> = {};

    context.pathArgs?.forEach((arg) => {
      if (
        (arg instanceof PathParam || arg instanceof SkipEncode) &&
        arg.key !== undefined
      ) {
        argsObject[arg.key] = arg.value;
      }
    });

    return argsObject;
  }

  private updatePathArgs(
    context: ParameterContext,
    argsObject: Record<string, unknown>
  ): void {
    if (!context.pathArgs) {
      return;
    }

    for (const arg of context.pathArgs) {
      this.assignPathArgValue(arg, argsObject);
    }
  }

  private assignPathArgValue(
    arg: unknown,
    argsObject: Record<string, unknown>
  ): void {
    if (
      (arg instanceof SkipEncode || arg instanceof PathParam) &&
      arg.key !== undefined &&
      arg.key in argsObject
    ) {
      arg.value = argsObject[arg.key];
    }
  }
}
