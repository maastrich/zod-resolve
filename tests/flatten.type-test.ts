/**
 * Type tests for FlattenSchema
 * These tests ensure that all deep keys are correctly resolved at the type level
 */

import { z } from "zod/v4";
import { FlattenSchema } from "../src/types";
import { Expect, Equal } from "type-testing";

// ============================================================================
// Basic Object Schemas
// ============================================================================

const simpleObject = z.object({
  name: z.string(),
  age: z.number(),
});

type SimpleObject = FlattenSchema<typeof simpleObject>;

type _test_simple_object = Expect<Equal<keyof SimpleObject, "name" | "age">>;

const nestedObject = z.object({
  user: z.object({
    name: z.string(),
    email: z.string(),
  }),
});

type NestedObject = FlattenSchema<typeof nestedObject>;

type _test_nested_object = Expect<
  Equal<keyof NestedObject, "user" | "user.name" | "user.email">
>;

const deeplyNestedObject = z.object({
  company: z.object({
    address: z.object({
      street: z.string(),
      city: z.string(),
      country: z.object({
        name: z.string(),
        code: z.string(),
      }),
    }),
  }),
});

type DeeplyNestedObject = FlattenSchema<typeof deeplyNestedObject>;

type _test_deeply_nested_object = Expect<
  Equal<
    keyof DeeplyNestedObject,
    | "company"
    | "company.address"
    | "company.address.street"
    | "company.address.city"
    | "company.address.country"
    | "company.address.country.name"
    | "company.address.country.code"
  >
>;

// ============================================================================
// Array Schemas
// ============================================================================

const simpleArray = z.array(z.string());

type SimpleArray = FlattenSchema<typeof simpleArray>;

type _test_simple_array = Expect<Equal<keyof SimpleArray, "[]">>;

const arrayOfObjects = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
  })
);

type ArrayOfObjects = FlattenSchema<typeof arrayOfObjects>;

type _test_array_of_objects = Expect<
  Equal<keyof ArrayOfObjects, "[]" | "[].id" | "[].name">
>;

const nestedArrays = z.array(z.array(z.number()));

type NestedArrays = FlattenSchema<typeof nestedArrays>;

type _test_nested_arrays = Expect<Equal<keyof NestedArrays, "[]" | "[][]">>;

const objectWithArray = z.object({
  items: z.array(z.string()),
  tags: z.array(z.number()),
});

type ObjectWithArray = FlattenSchema<typeof objectWithArray>;

type _test_object_with_array = Expect<
  Equal<keyof ObjectWithArray, "items" | "items[]" | "tags" | "tags[]">
>;

const complexArrayNesting = z.object({
  users: z.array(
    z.object({
      name: z.string(),
      contacts: z.array(
        z.object({
          type: z.string(),
          value: z.string(),
        })
      ),
    })
  ),
});

type ComplexArrayNesting = FlattenSchema<typeof complexArrayNesting>;

type _test_complex_array_nesting = Expect<
  Equal<
    keyof ComplexArrayNesting,
    | "users"
    | "users[]"
    | "users[].name"
    | "users[].contacts"
    | "users[].contacts[]"
    | "users[].contacts[].type"
    | "users[].contacts[].value"
  >
>;

// ============================================================================
// Tuple Schemas
// ============================================================================

const simpleTuple = z.tuple([z.string(), z.number(), z.boolean()]);

type SimpleTuple = FlattenSchema<typeof simpleTuple>;

type _test_simple_tuple = Expect<
  Equal<keyof SimpleTuple, "[0]" | "[1]" | "[2]">
>;

const tupleWithObjects = z.tuple([
  z.object({ name: z.string() }),
  z.object({ age: z.number() }),
]);

type TupleWithObjects = FlattenSchema<typeof tupleWithObjects>;

type _test_tuple_with_objects = Expect<
  Equal<keyof TupleWithObjects, "[0]" | "[0].name" | "[1]" | "[1].age">
>;

const tupleWithArrays = z.tuple([z.array(z.string()), z.array(z.number())]);

type TupleWithArrays = FlattenSchema<typeof tupleWithArrays>;

type _test_tuple_with_arrays = Expect<
  Equal<keyof TupleWithArrays, "[0]" | "[0][]" | "[1]" | "[1][]">
>;

const objectWithTuple = z.object({
  coordinates: z.tuple([z.number(), z.number()]),
  names: z.tuple([z.string(), z.string(), z.string()]),
});

type ObjectWithTuple = FlattenSchema<typeof objectWithTuple>;

type _test_object_with_tuple = Expect<
  Equal<
    keyof ObjectWithTuple,
    | "coordinates"
    | "coordinates[0]"
    | "coordinates[1]"
    | "names"
    | "names[0]"
    | "names[1]"
    | "names[2]"
  >
>;

// ============================================================================
// Union Schemas
// ============================================================================

const simpleUnion = z.union([z.string(), z.number()]);

type SimpleUnion = FlattenSchema<typeof simpleUnion>;

type _test_simple_union = Expect<Equal<keyof SimpleUnion, never>>;

const unionWithCommonFields = z.union([
  z.object({ type: z.literal("a"), value: z.string() }),
  z.object({ type: z.literal("b"), value: z.number() }),
]);

type UnionWithCommonFields = FlattenSchema<typeof unionWithCommonFields>;

type _test_union_with_common_fields = Expect<
  Equal<keyof UnionWithCommonFields, "type" | "value">
>;

const unionWithDifferentFields = z.union([
  z.object({ name: z.string(), age: z.number() }),
  z.object({ title: z.string(), count: z.number() }),
]);

type UnionWithDifferentFields = FlattenSchema<typeof unionWithDifferentFields>;

type _test_union_with_different_fields = Expect<
  Equal<keyof UnionWithDifferentFields, "name" | "age" | "title" | "count">
>;

const discriminatedUnion = z.union([
  z.object({
    type: z.literal("car"),
    fuel: z.string(),
    doors: z.number(),
    wheels: z.number(),
  }),
  z.object({
    type: z.literal("hybridcar"),
    doors: z.number(),
    wheels: z.number(),
    fuels: z.tuple([z.string(), z.string()]),
  }),
  z.object({
    type: z.literal("bike"),
    wheels: z.number(),
  }),
  z.object({
    type: z.literal("plane"),
    wings: z.number(),
    wheels: z.number(),
  }),
]);

type DiscriminatedUnion = FlattenSchema<typeof discriminatedUnion>;

type _test_discriminated_union = Expect<
  Equal<
    keyof DiscriminatedUnion,
    | "type"
    | "fuel"
    | "doors"
    | "wheels"
    | "fuels"
    | "fuels[0]"
    | "fuels[1]"
    | "wings"
  >
>;

const unionWithNestedObjects = z.union([
  z.object({
    type: z.literal("person"),
    data: z.object({ name: z.string(), age: z.number() }),
  }),
  z.object({
    type: z.literal("company"),
    data: z.object({ companyName: z.string(), employees: z.number() }),
  }),
]);

type UnionWithNestedObjects = FlattenSchema<typeof unionWithNestedObjects>;

type _test_union_with_nested_objects = Expect<
  Equal<
    keyof UnionWithNestedObjects,
    | "type"
    | "data"
    | "data.name"
    | "data.age"
    | "data.companyName"
    | "data.employees"
  >
>;

const unionWithArrays = z.union([
  z.object({ items: z.array(z.string()) }),
  z.object({ items: z.array(z.number()) }),
]);

type UnionWithArrays = FlattenSchema<typeof unionWithArrays>;

type _test_union_with_arrays = Expect<
  Equal<keyof UnionWithArrays, "items" | "items[]">
>;

// ============================================================================
// Optional and Nullable Schemas
// ============================================================================

const optionalFields = z.object({
  name: z.string().optional(),
  age: z.number().optional(),
});

type OptionalFields = FlattenSchema<typeof optionalFields>;

type _test_optional_fields = Expect<
  Equal<keyof OptionalFields, "name" | "age">
>;

const nullableFields = z.object({
  email: z.string().nullable(),
  phone: z.string().nullable(),
});

type NullableFields = FlattenSchema<typeof nullableFields>;

type _test_nullable_fields = Expect<
  Equal<keyof NullableFields, "email" | "phone">
>;

const optionalNestedObject = z.object({
  user: z
    .object({
      name: z.string(),
      email: z.string(),
    })
    .optional(),
});

type OptionalNestedObject = FlattenSchema<typeof optionalNestedObject>;

type _test_optional_nested_object = Expect<
  Equal<keyof OptionalNestedObject, "user" | "user.name" | "user.email">
>;

const nullableArray = z.object({
  tags: z.array(z.string()).nullable(),
});

type NullableArray = FlattenSchema<typeof nullableArray>;

type _test_nullable_array = Expect<
  Equal<keyof NullableArray, "tags" | "tags[]">
>;

const optionalAndNullable = z.object({
  data: z
    .object({
      value: z.string(),
      count: z.number(),
    })
    .optional()
    .nullable(),
});

type OptionalAndNullable = FlattenSchema<typeof optionalAndNullable>;

type _test_optional_and_nullable = Expect<
  Equal<keyof OptionalAndNullable, "data" | "data.value" | "data.count">
>;

// ============================================================================
// Complex Nested Schemas
// ============================================================================

const person = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  age: z.number(),
  birth: z.object({
    date: z.date(),
    place: z.string(),
  }),
});

type Person = FlattenSchema<typeof person>;

type _test_person = Expect<
  Equal<
    keyof Person,
    "id" | "email" | "name" | "age" | "birth" | "birth.date" | "birth.place"
  >
>;

const personOptional = person.optional();

type PersonOptional = FlattenSchema<typeof personOptional>;

type _test_person_optional = Expect<
  Equal<
    keyof PersonOptional,
    "id" | "email" | "name" | "age" | "birth" | "birth.date" | "birth.place"
  >
>;

const group = z.array(personOptional);

type Group = FlattenSchema<typeof group>;

type _test_group = Expect<
  Equal<
    keyof Group,
    | "[]"
    | "[].id"
    | "[].email"
    | "[].name"
    | "[].age"
    | "[].birth"
    | "[].birth.date"
    | "[].birth.place"
  >
>;

const family = z.object({
  parents: z.array(personOptional),
  children: z.array(personOptional),
});

type Family = FlattenSchema<typeof family>;

type _test_family = Expect<
  Equal<
    keyof Family,
    | "parents"
    | "parents[]"
    | "parents[].id"
    | "parents[].email"
    | "parents[].name"
    | "parents[].age"
    | "parents[].birth"
    | "parents[].birth.date"
    | "parents[].birth.place"
    | "children"
    | "children[]"
    | "children[].id"
    | "children[].email"
    | "children[].name"
    | "children[].age"
    | "children[].birth"
    | "children[].birth.date"
    | "children[].birth.place"
  >
>;

const complexSchema = z.object({
  id: z.string(),
  metadata: z.object({
    created: z.string(),
    updated: z.string().optional(),
  }),
  items: z.array(
    z.object({
      name: z.string(),
      tags: z.array(z.string()),
    })
  ),
  coordinates: z.tuple([z.number(), z.number()]),
  status: z.union([z.literal("active"), z.literal("inactive")]),
});

type ComplexSchema = FlattenSchema<typeof complexSchema>;

type _test_complex_schema = Expect<
  Equal<
    keyof ComplexSchema,
    | "id"
    | "metadata"
    | "metadata.created"
    | "metadata.updated"
    | "items"
    | "items[]"
    | "items[].name"
    | "items[].tags"
    | "items[].tags[]"
    | "coordinates"
    | "coordinates[0]"
    | "coordinates[1]"
    | "status"
  >
>;

const deeplyOptionalStructure = z.object({
  user: z
    .object({
      profile: z
        .object({
          bio: z.string(),
          avatar: z.string().optional(),
          social: z
            .object({
              twitter: z.string(),
              github: z.string(),
            })
            .nullable(),
        })
        .optional(),
      contacts: z
        .array(
          z.object({
            type: z.string(),
            value: z.string(),
          })
        )
        .nullable(),
    })
    .optional(),
});

type DeeplyOptionalStructure = FlattenSchema<typeof deeplyOptionalStructure>;

type _test_deeply_optional_structure = Expect<
  Equal<
    keyof DeeplyOptionalStructure,
    | "user"
    | "user.profile"
    | "user.profile.bio"
    | "user.profile.avatar"
    | "user.profile.social"
    | "user.profile.social.twitter"
    | "user.profile.social.github"
    | "user.contacts"
    | "user.contacts[]"
    | "user.contacts[].type"
    | "user.contacts[].value"
  >
>;

// ============================================================================
// Edge Cases
// ============================================================================

const emptyObject = z.object({});

type EmptyObject = FlattenSchema<typeof emptyObject>;

type _test_empty_object = Expect<Equal<keyof EmptyObject, never>>;

const emptyTuple = z.tuple([]);

type EmptyTuple = FlattenSchema<typeof emptyTuple>;

type _test_empty_tuple = Expect<Equal<keyof EmptyTuple, never>>;

const deeplyNestedArrays = z.array(z.array(z.array(z.string())));

type DeeplyNestedArrays = FlattenSchema<typeof deeplyNestedArrays>;

type _test_deeply_nested_arrays = Expect<
  Equal<keyof DeeplyNestedArrays, "[]" | "[][]" | "[][][]">
>;

const mixedTupleAndArray = z.tuple([
  z.array(z.object({ id: z.string() })),
  z.object({ items: z.array(z.number()) }),
]);

type MixedTupleAndArray = FlattenSchema<typeof mixedTupleAndArray>;

type _test_mixed_tuple_and_array = Expect<
  Equal<
    keyof MixedTupleAndArray,
    "[0]" | "[0][]" | "[0][].id" | "[1]" | "[1].items" | "[1].items[]"
  >
>;

// ============================================================================
// Real-world Example: API Response
// ============================================================================

const apiResponse = z.object({
  success: z.boolean(),
  data: z.object({
    user: z.object({
      id: z.string(),
      profile: z.object({
        name: z.string(),
        email: z.string(),
      }),
      settings: z.object({
        notifications: z.object({
          email: z.boolean(),
          push: z.boolean(),
        }),
        privacy: z.object({
          publicProfile: z.boolean(),
        }),
      }),
    }),
    posts: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        tags: z.array(z.string()),
        author: z.object({
          id: z.string(),
          name: z.string(),
        }),
      })
    ),
  }),
  metadata: z.object({
    timestamp: z.date(),
    version: z.string(),
  }),
});

type ApiResponse = FlattenSchema<typeof apiResponse>;

type _test_api_response = Expect<
  Equal<
    keyof ApiResponse,
    | "success"
    | "data"
    | "data.user"
    | "data.user.id"
    | "data.user.profile"
    | "data.user.profile.name"
    | "data.user.profile.email"
    | "data.user.settings"
    | "data.user.settings.notifications"
    | "data.user.settings.notifications.email"
    | "data.user.settings.notifications.push"
    | "data.user.settings.privacy"
    | "data.user.settings.privacy.publicProfile"
    | "data.posts"
    | "data.posts[]"
    | "data.posts[].id"
    | "data.posts[].title"
    | "data.posts[].tags"
    | "data.posts[].tags[]"
    | "data.posts[].author"
    | "data.posts[].author.id"
    | "data.posts[].author.name"
    | "metadata"
    | "metadata.timestamp"
    | "metadata.version"
  >
>;
