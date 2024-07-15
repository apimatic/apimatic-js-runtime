import {
  Schema,
  SchemaMappedType,
  SchemaType,
  SchemaValidationError,
} from '../schema';
import { objectEntries } from '../utils';
import { ObjectXmlOptions } from './object';

export function discriminatedObject<
  TSchema extends Schema<any, any>,
  TDiscrimProp extends keyof SchemaType<TSchema>,
  TDiscrimMappedProp extends keyof SchemaMappedType<TSchema>,
  TDiscrimMap extends Record<string, TSchema>
>(
  discriminatorMappedPropName: TDiscrimMappedProp,
  discriminatorPropName: TDiscrimProp,
  discriminatorMap: TDiscrimMap,
  defaultDiscriminator: keyof TDiscrimMap,
  xmlOptions?: ObjectXmlOptions
): Schema<any, any> {
  const allSchemas = Object.values(discriminatorMap).reverse();
  const selectSchema = (
    value: unknown,
    discriminatorProp: string | TDiscrimProp | TDiscrimMappedProp,
    checker: (schema: TSchema) => SchemaValidationError[],
    isAttr: boolean = false
  ) => {
    if (
      typeof value === 'object' &&
      value !== null &&
      ((isAttr && xmlObjectHasAttribute(value, discriminatorProp as string)) ||
        (!isAttr && (discriminatorProp as string) in value))
    ) {
      const discriminatorValue = isAttr
        ? (value as { $: Record<string, unknown> }).$[
            discriminatorProp as string
          ]
        : (value as Record<typeof discriminatorProp, unknown>)[
            discriminatorProp
          ];
      if (
        typeof discriminatorValue === 'string' &&
        discriminatorValue in discriminatorMap
      ) {
        return discriminatorMap[discriminatorValue];
      }
    }
    for (const key in allSchemas) {
      if (checker(allSchemas[key]).length === 0) {
        return allSchemas[key];
      }
    }
    return discriminatorMap[defaultDiscriminator];
  };

  return {
    type: () =>
      `DiscriminatedUnion<${discriminatorPropName as string},[${objectEntries(
        discriminatorMap
      )
        .map(([_, v]) => v.type)
        .join(',')}]>`,
    map: (value, ctxt) =>
      selectSchema(value, discriminatorPropName, (schema) =>
        schema.validateBeforeMap(value, ctxt)
      ).map(value, ctxt),
    unmap: (value, ctxt) =>
      selectSchema(value, discriminatorMappedPropName, (schema) =>
        schema.validateBeforeUnmap(value, ctxt)
      ).unmap(value, ctxt),
    validateBeforeMap: (value, ctxt) =>
      selectSchema(value, discriminatorPropName, (schema) =>
        schema.validateBeforeMap(value, ctxt)
      ).validateBeforeMap(value, ctxt),
    validateBeforeUnmap: (value, ctxt) =>
      selectSchema(value, discriminatorMappedPropName, (schema) =>
        schema.validateBeforeUnmap(value, ctxt)
      ).validateBeforeUnmap(value, ctxt),
    mapXml: (value, ctxt) =>
      selectSchema(
        value,
        xmlOptions?.xmlName ?? discriminatorPropName,
        (schema) => schema.validateBeforeMapXml(value, ctxt),
        xmlOptions?.isAttr
      ).mapXml(value, ctxt),
    unmapXml: (value, ctxt) =>
      selectSchema(value, discriminatorMappedPropName, (schema) =>
        schema.validateBeforeUnmap(value, ctxt)
      ).unmapXml(value, ctxt),
    validateBeforeMapXml: (value, ctxt) =>
      selectSchema(
        value,
        xmlOptions?.xmlName ?? discriminatorPropName,
        (schema) => schema.validateBeforeMapXml(value, ctxt),
        xmlOptions?.isAttr
      ).validateBeforeMapXml(value, ctxt),
  };
}

function xmlObjectHasAttribute(value: object, prop: string): boolean {
  return (
    '$' in value &&
    typeof (value as { $: unknown }).$ === 'object' &&
    (prop as string) in (value as { $: Record<string, unknown> }).$
  );
}
