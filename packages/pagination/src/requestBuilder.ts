export interface RequestBuilder<TRequest> {
  query(parameters: Record<string, unknown>): void;
  updateParameterByJsonPointer(
    pointer: string | null,
    setter: (value: any) => any
  ): void;
  clone(): TRequest;
}
