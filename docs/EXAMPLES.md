# Examples

Practical examples demonstrating `@maastrich/zod-resolve` usage.

## Basic Usage

### Simple Object Navigation

```typescript
import { z } from "zod";
import { resolve } from "@maastrich/zod-resolve";

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

// Resolve individual fields
const nameSchema = resolve(userSchema, "name");
const emailSchema = resolve(userSchema, "email");

// Use resolved schemas for validation
nameSchema.parse("John Doe"); // ✓
emailSchema.parse("user@example.com"); // ✓
```

### Nested Objects

```typescript
const companySchema = z.object({
  name: z.string(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    country: z.object({
      name: z.string(),
      code: z.string().length(2),
    }),
  }),
});

// Navigate through nested structure
const citySchema = resolve(companySchema, "address.city");
const countryCodeSchema = resolve(companySchema, "address.country.code");

countryCodeSchema.parse("US"); // ✓
```

## Working with Arrays

### Array of Primitives

```typescript
const tagsSchema = z.array(z.string().min(1).max(20));

// Get the element schema
const tagSchema = resolve(tagsSchema, "[]");

tagSchema.parse("javascript"); // ✓
```

### Array of Objects

```typescript
const postsSchema = z.object({
  posts: z.array(
    z.object({
      id: z.string().uuid(),
      title: z.string().min(1),
      content: z.string(),
      published: z.boolean(),
    })
  ),
});

// Access array element schema
const postSchema = resolve(postsSchema, "posts[]");

// Access nested fields within array elements
const titleSchema = resolve(postsSchema, "posts[].title");
const publishedSchema = resolve(postsSchema, "posts[].published");

titleSchema.parse("My Blog Post"); // ✓
```

### Nested Arrays

```typescript
const matrixSchema = z.array(z.array(z.number()));

const rowSchema = resolve(matrixSchema, "[]"); // ZodArray<ZodNumber>
const cellSchema = resolve(matrixSchema, "[][]"); // ZodNumber

cellSchema.parse(42); // ✓
```

## Working with Tuples

### Fixed-Length Tuples

```typescript
const coordinateSchema = z.object({
  location: z.tuple([
    z.number().min(-90).max(90), // latitude
    z.number().min(-180).max(180), // longitude
  ]),
});

const latSchema = resolve(coordinateSchema, "location[0]");
const lngSchema = resolve(coordinateSchema, "location[1]");

latSchema.parse(40.7128); // ✓
lngSchema.parse(-74.006); // ✓
```

### Tuples with Objects

```typescript
const responseSchema = z.tuple([
  z.object({ status: z.number() }),
  z.object({ data: z.string() }),
]);

const statusObjSchema = resolve(responseSchema, "[0]");
const statusSchema = resolve(responseSchema, "[0].status");
const dataSchema = resolve(responseSchema, "[1].data");

statusSchema.parse(200); // ✓
```

## Union Types

### Discriminated Union

```typescript
const vehicleSchema = z.union([
  z.object({
    type: z.literal("car"),
    wheels: z.number(),
    doors: z.number(),
  }),
  z.object({
    type: z.literal("bike"),
    wheels: z.number(),
    gears: z.number(),
  }),
]);

// Common fields return a union
const typeSchema = resolve(vehicleSchema, "type");
// ZodUnion<[ZodLiteral<'car'>, ZodLiteral<'bike'>]>

const wheelsSchema = resolve(vehicleSchema, "wheels");
// ZodUnion<[ZodNumber, ZodNumber]>

// Unique fields return their single type
const doorsSchema = resolve(vehicleSchema, "doors"); // ZodNumber
const gearsSchema = resolve(vehicleSchema, "gears"); // ZodNumber
```

## Optional and Nullable Fields

### Optional Fields

```typescript
const profileSchema = z.object({
  name: z.string(),
  bio: z.string().optional(),
  settings: z
    .object({
      theme: z.string(),
      notifications: z.boolean(),
    })
    .optional(),
});

// Optional wrapper is preserved
const bioSchema = resolve(profileSchema, "bio");
// ZodOptional<ZodString>

// Can traverse through optional objects
const themeSchema = resolve(profileSchema, "settings.theme");
// ZodString
```

### Nullable Fields

```typescript
const articleSchema = z.object({
  title: z.string(),
  author: z.string().nullable(),
  tags: z.array(z.string()).nullable(),
});

const authorSchema = resolve(articleSchema, "author");
// ZodNullable<ZodString>

const tagElementSchema = resolve(articleSchema, "tags[]");
// ZodString (unwraps nullable array)
```

## Practical Use Cases

### Form Validation

```typescript
const registrationSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(8),
  profile: z.object({
    firstName: z.string(),
    lastName: z.string(),
    age: z.number().min(13),
  }),
  interests: z.array(z.string()),
});

// Validate individual form fields
function validateField(field: string, value: unknown) {
  const schema = resolve(registrationSchema, field as any);
  return schema.safeParse(value);
}

validateField("username", "john_doe"); // ✓
validateField("profile.age", 25); // ✓
validateField("interests[]", "programming"); // ✓
```

### API Response Validation

```typescript
const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    users: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        posts: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            tags: z.array(z.string()),
          })
        ),
      })
    ),
  }),
  metadata: z.object({
    page: z.number(),
    total: z.number(),
  }),
});

// Validate nested API data
const userIdSchema = resolve(apiResponseSchema, "data.users[].id");
const postTitleSchema = resolve(
  apiResponseSchema,
  "data.users[].posts[].title"
);
const tagSchema = resolve(apiResponseSchema, "data.users[].posts[].tags[]");

userIdSchema.parse("user-123"); // ✓
postTitleSchema.parse("Hello World"); // ✓
tagSchema.parse("typescript"); // ✓
```

### Dynamic Schema Introspection

```typescript
import { flatten } from "@maastrich/zod-resolve";

const schema = z.object({
  user: z.object({
    name: z.string(),
    email: z.string(),
  }),
  items: z.array(z.string()),
});

const flat = flatten(schema);

// List all available paths
const paths = Object.keys(flat);
// ['user', 'user.name', 'user.email', 'items', 'items[]']

// Generate validation logic dynamically
paths.forEach((path) => {
  const schema = flat[path];
  console.log(`Path: ${path}, Type: ${schema._def.typeName}`);
});
```

### Type-Safe Path Builder

```typescript
type PathOf<T extends z.ZodType> = keyof FlattenSchema<T>;

function createValidator<T extends z.ZodType>(schema: T) {
  return {
    validate<P extends PathOf<T>>(path: P, value: unknown) {
      const subSchema = resolve(schema, path);
      return subSchema.safeParse(value);
    },
  };
}

const userSchema = z.object({
  name: z.string(),
  age: z.number(),
});

const validator = createValidator(userSchema);

// Type-safe path strings with autocomplete
validator.validate("name", "John"); // ✓
validator.validate("age", 25); // ✓
// validator.validate('invalid', 'x'); // TypeScript error
```

## Complex Real-World Example

```typescript
const blogSchema = z.object({
  site: z.object({
    name: z.string(),
    url: z.string().url(),
    config: z.object({
      theme: z.enum(["light", "dark"]),
      language: z.string(),
    }),
  }),
  authors: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      email: z.string().email(),
      bio: z.string().optional(),
      socials: z
        .array(
          z.object({
            platform: z.string(),
            url: z.string().url(),
          })
        )
        .optional(),
    })
  ),
  posts: z.array(
    z.object({
      id: z.string().uuid(),
      title: z.string().min(1).max(200),
      content: z.string(),
      authorId: z.string().uuid(),
      tags: z.array(z.string()),
      metadata: z.object({
        views: z.number(),
        likes: z.number(),
        published: z.boolean(),
      }),
      comments: z.array(
        z.object({
          id: z.string().uuid(),
          author: z.string(),
          content: z.string(),
          timestamp: z.string().datetime(),
        })
      ),
    })
  ),
});

// Access any nested path
const themeSchema = resolve(blogSchema, "site.config.theme");
const authorEmailSchema = resolve(blogSchema, "authors[].email");
const postTitleSchema = resolve(blogSchema, "posts[].title");
const socialUrlSchema = resolve(blogSchema, "authors[].socials[].url");
const commentContentSchema = resolve(blogSchema, "posts[].comments[].content");
const viewsSchema = resolve(blogSchema, "posts[].metadata.views");

// All paths are type-safe and autocompleted in IDEs
```
