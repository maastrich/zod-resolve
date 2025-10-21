# API Reference

Complete API documentation for `@maastrich/zod-resolve`.

## Functions

### `resolve(schema, key)`

Resolves a sub-schema from a Zod schema using path notation.

**Type Signature:**

```typescript
function resolve<
  Schema extends core.$ZodType,
  Key extends keyof FlattenSchema<Schema>,
>(schema: Schema, key: Key): FlattenSchema<Schema>[Key];
```

**Parameters:**

- `schema`: The Zod schema to resolve from
- `key`: Path string using dot notation, array brackets, or tuple indices

**Returns:** The resolved Zod sub-schema at the specified path

**Example:**

```typescript
import { z } from "zod";
import { resolve } from "@maastrich/zod-resolve";

const userSchema = z.object({
  name: z.string(),
  profile: z.object({
    age: z.number(),
    email: z.string(),
  }),
});

const nameSchema = resolve(userSchema, "name"); // ZodString
const ageSchema = resolve(userSchema, "profile.age"); // ZodNumber
```

**See also:** [Path Syntax Guide](./PATH_SYNTAX.md)

---

### `flatten(schema)`

Flattens a Zod schema into a record mapping path strings to their corresponding sub-schemas.

**Type Signature:**

```typescript
function flatten<T extends core.$ZodType>(schema: T): FlattenSchema<T, "">;
```

**Parameters:**

- `schema`: The Zod schema to flatten

**Returns:** Record object with path strings as keys and Zod schemas as values

**Example:**

```typescript
import { z } from "zod";
import { flatten } from "@maastrich/zod-resolve";

const schema = z.object({
  name: z.string(),
  items: z.array(z.number()),
});

const flat = flatten(schema);
// {
//   name: ZodString,
//   items: ZodArray,
//   'items[]': ZodNumber
// }
```

**Use Cases:**

- Introspection of all available paths
- Dynamic schema traversal
- Code generation based on schema structure

---

## Types

### `FlattenSchema<T>`

Type that computes the flattened representation of a Zod schema.

**Type Definition:**

```typescript
type FlattenSchema<
  T extends core.$ZodType,
  Prefix extends string = ""
>
```

**Type Parameters:**

- `T`: The Zod schema type to flatten
- `Prefix`: Internal prefix for recursion (typically omitted)

**Example:**

```typescript
import { z } from "zod";
import type { FlattenSchema } from "@maastrich/zod-resolve";

const schema = z.object({
  user: z.object({
    name: z.string(),
  }),
});

type Paths = FlattenSchema<typeof schema>;
// {
//   user: ZodObject<{ name: ZodString }>,
//   'user.name': ZodString
// }

type Keys = keyof Paths;
// 'user' | 'user.name'
```

**Use Cases:**

- Type-safe path string validation
- Autocomplete for path strings in IDEs
- Compile-time path validation
