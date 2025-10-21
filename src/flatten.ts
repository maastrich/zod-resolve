import {
  core,
  z,
  ZodArray,
  ZodDefault,
  ZodNullable,
  ZodObject,
  ZodOptional,
  ZodTuple,
  ZodUnion,
} from "zod/v4";
import { FlattenSchema } from "./types";

function mergeSchemas(
  schemas: Record<string, core.$ZodType>[],
): Record<string, core.$ZodType> {
  return schemas.reduce<Record<string, core.$ZodType>>((acc, schema) => {
    return Object.entries(schema).reduce<Record<string, core.$ZodType>>(
      (acc, [key, value]) => {
        const current = key in acc ? acc[key] : undefined;
        acc[key] = current
          ? current instanceof ZodUnion
            ? z.union([...current.options, value])
            : z.union([current, value])
          : value;
        return acc;
      },
      acc,
    );
  }, {});
}

function unwrapSchema(schema: core.$ZodType): core.$ZodType {
  if (
    schema instanceof ZodOptional ||
    schema instanceof ZodDefault ||
    schema instanceof ZodNullable
  ) {
    return unwrapSchema(schema.unwrap());
  }
  return schema;
}

function flattenUnionSchema(
  schema: core.$ZodType,
  prefix: string,
): Record<string, core.$ZodType> {
  // Implementation goes here
  if (!(schema instanceof ZodUnion)) {
    return {};
  }

  return mergeSchemas(
    schema.options.map((option) => flattenSchema(option, prefix)),
  );
}

function flattenObjectSchema(
  schema: core.$ZodType,
  prefix: string,
): Record<string, core.$ZodType> {
  // Implementation goes here
  if (!(schema instanceof ZodObject)) {
    return {};
  }
  const { shape } = schema;
  return mergeSchemas(
    Object.entries(shape).map(([key, value]) => {
      const newKey = prefix ? `${prefix}.${key}` : key;
      return mergeSchemas([
        {
          [newKey]: value,
        },
        flattenSchema(value, newKey),
      ]);
    }),
  );
}

function flattenArraySchema(
  schema: core.$ZodType,
  prefix: string,
): Record<string, core.$ZodType> {
  // Implementation goes here
  if (!(schema instanceof ZodArray)) {
    return {};
  }
  const element: core.$ZodType = schema.element;
  const newPrefix = prefix + "[]";
  return mergeSchemas([
    { [newPrefix]: element },
    flattenSchema(element, newPrefix),
  ]);
}

function flattenTupleSchema(
  schema: core.$ZodType,
  prefix: string,
): Record<string, core.$ZodType> {
  if (!(schema instanceof ZodTuple)) {
    return {};
  }
  const elements = schema.def.items;
  return mergeSchemas(
    elements.map((element, index) => {
      const newPrefix = prefix + `[${index}]`;
      return mergeSchemas([
        { [newPrefix]: element },
        flattenSchema(element, newPrefix),
      ]);
    }),
  );
}

function flattenSchema(
  schema: core.$ZodType,
  prefix: string,
): Record<string, core.$ZodType> {
  // Implementation goes here
  const unwraped = unwrapSchema(schema);

  return mergeSchemas([
    flattenArraySchema(unwraped, prefix),
    flattenTupleSchema(unwraped, prefix),
    flattenObjectSchema(unwraped, prefix),
    flattenUnionSchema(unwraped, prefix),
  ]);
}

export function flatten<T extends core.$ZodType>(
  schema: T,
): FlattenSchema<T, ""> {
  return flattenSchema(schema, "") as FlattenSchema<T, "">;
}
