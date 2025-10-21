import { core } from "zod/v4";
import { FlattenSchema } from "./types";
import { flatten } from "./flatten";

export function resolve<
  Schema extends core.$ZodType,
  Key extends keyof FlattenSchema<Schema>,
>(schema: Schema, key: Key): FlattenSchema<Schema>[Key] {
  const flat = flatten(schema);
  return flat[key];
}
