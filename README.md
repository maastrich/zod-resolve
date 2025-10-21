# @maastrich/zod-resolve

Type-safe Zod sub-schema resolver using path notation with support for arrays, tuples, and unions.

## Installation

```bash
npm install @maastrich/zod-resolve
# or
pnpm add @maastrich/zod-resolve
# or
yarn add @maastrich/zod-resolve
```

## Quick Start

```typescript
import { z } from "zod";
import { resolve } from "@maastrich/zod-resolve";

const userSchema = z.object({
  name: z.string(),
  profile: z.object({
    age: z.number(),
    email: z.string().email(),
  }),
  posts: z.array(
    z.object({
      title: z.string(),
      tags: z.array(z.string()),
    })
  ),
});

// Resolve nested schemas using path notation
const nameSchema = resolve(userSchema, "name"); // ZodString
const ageSchema = resolve(userSchema, "profile.age"); // ZodNumber
const postSchema = resolve(userSchema, "posts[]"); // ZodObject
const tagSchema = resolve(userSchema, "posts[].tags[]"); // ZodString

// Use resolved schemas for validation
nameSchema.parse("John Doe"); // ✓
ageSchema.parse(25); // ✓
tagSchema.parse("typescript"); // ✓
```

## Features

- **Type-safe path strings** - Full TypeScript autocomplete and validation
- **Dot notation** - Navigate nested objects: `user.profile.name`
- **Array access** - Access array elements: `items[]`, `users[].posts[]`
- **Tuple indexing** - Access tuple elements by index: `coordinates[0]`
- **Union support** - Access fields from all union branches
- **Smart unwrapping** - Automatic unwrapping of optional/nullable wrappers for traversal

## Core API

### `resolve(schema, path)`

Resolves a sub-schema at the given path.

```typescript
import { resolve } from "@maastrich/zod-resolve";

const schema = z.object({
  user: z.object({ name: z.string() }),
});

const nameSchema = resolve(schema, "user.name"); // ZodString
```

[Full API Documentation →](./docs/API.md)

### `flatten(schema)`

Flattens a schema into a record of all accessible paths.

```typescript
import { flatten } from "@maastrich/zod-resolve";

const schema = z.object({
  name: z.string(),
  items: z.array(z.number()),
});

const flat = flatten(schema);
// {
//   name: ZodString,
//   items: ZodArray<ZodNumber>,
//   'items[]': ZodNumber
// }
```

## Path Syntax

| Pattern         | Example                  | Description                        |
| --------------- | ------------------------ | ---------------------------------- |
| Property access | `user.name`              | Navigate nested objects using dots |
| Array elements  | `items[]`                | Access array element schema        |
| Tuple indices   | `coords[0]`              | Access tuple element by index      |
| Combined        | `users[].posts[].tags[]` | Navigate complex nested structures |

[Complete Path Syntax Guide →](./docs/PATH_SYNTAX.md)

## Examples

### Basic Usage

```typescript
const schema = z.object({
  id: z.string(),
  metadata: z.object({
    created: z.string(),
    updated: z.string(),
  }),
});

resolve(schema, "id"); // ZodString
resolve(schema, "metadata.created"); // ZodString
```

### Arrays

```typescript
const schema = z.object({
  users: z.array(
    z.object({
      name: z.string(),
      contacts: z.array(z.string()),
    })
  ),
});

resolve(schema, "users[]"); // ZodObject
resolve(schema, "users[].name"); // ZodString
resolve(schema, "users[].contacts[]"); // ZodString
```

### Tuples

```typescript
const schema = z.object({
  coordinates: z.tuple([
    z.number(), // latitude
    z.number(), // longitude
  ]),
});

resolve(schema, "coordinates[0]"); // ZodNumber (latitude)
resolve(schema, "coordinates[1]"); // ZodNumber (longitude)
```

### Unions

```typescript
const schema = z.union([
  z.object({ type: z.literal("car"), doors: z.number() }),
  z.object({ type: z.literal("bike"), gears: z.number() }),
]);

resolve(schema, "type"); // ZodUnion<[ZodLiteral<'car'>, ZodLiteral<'bike'>]>
resolve(schema, "doors"); // ZodNumber
resolve(schema, "gears"); // ZodNumber
```

[More Examples →](./docs/EXAMPLES.md)

## Use Cases

- **Form validation** - Validate individual form fields dynamically
- **API validation** - Resolve schemas for nested API response fields
- **Type-safe builders** - Create type-safe path-based utilities
- **Schema introspection** - Analyze and traverse schema structures
- **Dynamic validation** - Build flexible validation logic

## Documentation

- [API Reference](./docs/API.md) - Complete API documentation
- [Path Syntax Guide](./docs/PATH_SYNTAX.md) - Detailed path notation reference
- [Examples](./docs/EXAMPLES.md) - Practical usage examples

## Requirements

- `zod` ^3.0.0
- TypeScript 5.0+

## License

MIT © [Mathis Pinsault](LICENSE)
