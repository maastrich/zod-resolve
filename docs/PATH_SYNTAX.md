# Path Syntax Guide

Understanding path notation in `@maastrich/zod-resolve`.

## Overview

Path strings use a combination of dot notation, array brackets, and tuple indices to navigate nested schema structures.

## Syntax Rules

### Object Properties (Dot Notation)

Access nested object properties using dots.

```typescript
import { z } from "zod";
import { resolve } from "@maastrich/zod-resolve";

const schema = z.object({
  user: z.object({
    profile: z.object({
      name: z.string(),
    }),
  }),
});

resolve(schema, "user"); // ZodObject
resolve(schema, "user.profile"); // ZodObject
resolve(schema, "user.profile.name"); // ZodString
```

### Array Elements (`[]`)

Access array element schemas using empty brackets.

```typescript
const schema = z.object({
  items: z.array(z.string()),
});

resolve(schema, "items"); // ZodArray
resolve(schema, "items[]"); // ZodString
```

**Nested Arrays:**

```typescript
const schema = z.array(z.array(z.number()));

resolve(schema, "[]"); // ZodArray<ZodNumber>
resolve(schema, "[][]"); // ZodNumber
```

### Tuple Elements (`[N]`)

Access tuple elements by index using numeric brackets.

```typescript
const schema = z.object({
  coordinates: z.tuple([
    z.number(), // latitude
    z.number(), // longitude
  ]),
});

resolve(schema, "coordinates"); // ZodTuple
resolve(schema, "coordinates[0]"); // ZodNumber (latitude)
resolve(schema, "coordinates[1]"); // ZodNumber (longitude)
```

### Combined Paths

Combine all syntax forms for complex navigation.

```typescript
const schema = z.object({
  users: z.array(
    z.object({
      name: z.string(),
      posts: z.array(
        z.object({
          title: z.string(),
          tags: z.array(z.string()),
        })
      ),
    })
  ),
});

// Navigate through arrays and objects
resolve(schema, "users[]"); // User object schema
resolve(schema, "users[].name"); // ZodString
resolve(schema, "users[].posts[]"); // Post object schema
resolve(schema, "users[].posts[].title"); // ZodString
resolve(schema, "users[].posts[].tags[]"); // ZodString
```

## Special Cases

### Optional Fields

Optional wrappers are preserved in the resolved schema but unwrapped for path traversal.

```typescript
const schema = z.object({
  user: z
    .object({
      name: z.string(),
      email: z.string(),
    })
    .optional(),
});

// Returns the optional wrapper
resolve(schema, "user"); // ZodOptional<ZodObject>

// Traverses through optional to inner fields
resolve(schema, "user.name"); // ZodString
resolve(schema, "user.email"); // ZodString
```

### Nullable Fields

Similar to optional, nullable wrappers are preserved but traversed.

```typescript
const schema = z.object({
  tags: z.array(z.string()).nullable(),
});

resolve(schema, "tags"); // ZodNullable<ZodArray>
resolve(schema, "tags[]"); // ZodString
```

### Union Types

For unions, fields from all branches are accessible. Common fields return a union of their types.

```typescript
const schema = z.union([
  z.object({
    type: z.literal("user"),
    name: z.string(),
    email: z.string(),
  }),
  z.object({
    type: z.literal("admin"),
    name: z.string(),
    permissions: z.array(z.string()),
  }),
]);

// Common field: returns union of both types
resolve(schema, "type"); // ZodUnion<[ZodLiteral<'user'>, ZodLiteral<'admin'>]>
resolve(schema, "name"); // ZodUnion<[ZodString, ZodString]>

// Unique fields: returns single type from that branch
resolve(schema, "email"); // ZodString
resolve(schema, "permissions"); // ZodArray<ZodString>
```

## Path Examples by Schema Type

### Simple Object

```typescript
z.object({ name: z.string() });
// Paths: 'name'
```

### Nested Object

```typescript
z.object({
  user: z.object({
    name: z.string(),
  }),
});
// Paths: 'user', 'user.name'
```

### Array

```typescript
z.array(z.string());
// Paths: '[]'
```

### Object with Array

```typescript
z.object({
  items: z.array(
    z.object({
      id: z.string(),
    })
  ),
});
// Paths: 'items', 'items[]', 'items[].id'
```

### Tuple

```typescript
z.tuple([z.string(), z.number()]);
// Paths: '[0]', '[1]'
```

### Complex Schema

```typescript
z.object({
  metadata: z.object({
    created: z.string(),
  }),
  items: z.array(
    z.object({
      id: z.string(),
      tags: z.array(z.string()),
    })
  ),
  coordinates: z.tuple([z.number(), z.number()]),
});
// Paths:
//   'metadata', 'metadata.created',
//   'items', 'items[]', 'items[].id', 'items[].tags', 'items[].tags[]',
//   'coordinates', 'coordinates[0]', 'coordinates[1]'
```
