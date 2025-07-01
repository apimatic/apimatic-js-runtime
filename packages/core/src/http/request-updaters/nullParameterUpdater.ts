import { ParameterContext, ParameterUpdater } from './parameterUpdater';

export class NullParameterUpdater implements ParameterUpdater {
  public update(
    _context: ParameterContext,
    _pointer: string,
    _setter: (value: any) => any
  ): void {
    // null object pattern
  }
}
