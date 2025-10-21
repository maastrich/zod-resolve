/**
 * Type tests for resolve()
 * These tests ensure that all deep types are correctly resolved at the type level
 */

import { z } from "zod/v4";
import { resolve } from "../src/resolve";
import { Expect, Equal } from "type-testing";

// ============================================================================
// Basic Object Type Resolution
// ============================================================================

const simpleObject = z.object({
  name: z.string(),
  age: z.number(),
  active: z.boolean(),
});

type _test_simple_object_name = Expect<
  Equal<ReturnType<typeof simpleObject.shape.name.parse>, string>
>;

type _test_simple_object_age = Expect<
  Equal<ReturnType<typeof simpleObject.shape.age.parse>, number>
>;

type _test_resolve_simple_name = Expect<
  Equal<
    ReturnType<typeof resolve<typeof simpleObject, "name">>,
    typeof simpleObject.shape.name
  >
>;

const nestedObject = z.object({
  user: z.object({
    name: z.string(),
    email: z.string(),
    age: z.number(),
  }),
});

type _test_resolve_nested_user = Expect<
  Equal<
    ReturnType<typeof resolve<typeof nestedObject, "user">>,
    typeof nestedObject.shape.user
  >
>;

type _test_resolve_nested_user_name = Expect<
  Equal<
    ReturnType<typeof resolve<typeof nestedObject, "user.name">>,
    typeof nestedObject.shape.user.shape.name
  >
>;

type _test_resolve_nested_user_email = Expect<
  Equal<
    ReturnType<typeof resolve<typeof nestedObject, "user.email">>,
    typeof nestedObject.shape.user.shape.email
  >
>;

const deeplyNested = z.object({
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

type _test_resolve_deep_street = Expect<
  Equal<
    ReturnType<typeof resolve<typeof deeplyNested, "company.address.street">>,
    typeof deeplyNested.shape.company.shape.address.shape.street
  >
>;

type _test_resolve_deep_country_name = Expect<
  Equal<
    ReturnType<
      typeof resolve<typeof deeplyNested, "company.address.country.name">
    >,
    typeof deeplyNested.shape.company.shape.address.shape.country.shape.name
  >
>;

// ============================================================================
// Array Type Resolution
// ============================================================================

const simpleArray = z.array(z.string());

type _test_resolve_array_element = Expect<
  Equal<
    ReturnType<typeof resolve<typeof simpleArray, "[]">>,
    typeof simpleArray.element
  >
>;

const arrayOfObjects = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
  })
);

type _test_resolve_array_object = Expect<
  Equal<
    ReturnType<typeof resolve<typeof arrayOfObjects, "[]">>,
    typeof arrayOfObjects.element
  >
>;

type _test_resolve_array_object_id = Expect<
  Equal<
    ReturnType<typeof resolve<typeof arrayOfObjects, "[].id">>,
    typeof arrayOfObjects.element.shape.id
  >
>;

const nestedArrays = z.array(z.array(z.number()));

type _test_resolve_nested_array = Expect<
  Equal<
    ReturnType<typeof resolve<typeof nestedArrays, "[]">>,
    typeof nestedArrays.element
  >
>;

type _test_resolve_nested_array_element = Expect<
  Equal<
    ReturnType<typeof resolve<typeof nestedArrays, "[][]">>,
    typeof nestedArrays.element.element
  >
>;

const objectWithArrays = z.object({
  items: z.array(z.string()),
  numbers: z.array(z.number()),
});

type _test_resolve_object_array = Expect<
  Equal<
    ReturnType<typeof resolve<typeof objectWithArrays, "items">>,
    typeof objectWithArrays.shape.items
  >
>;

type _test_resolve_object_array_element = Expect<
  Equal<
    ReturnType<typeof resolve<typeof objectWithArrays, "items[]">>,
    typeof objectWithArrays.shape.items.element
  >
>;

const complexArrayStructure = z.object({
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

type _test_resolve_complex_array_user = Expect<
  Equal<
    ReturnType<typeof resolve<typeof complexArrayStructure, "users[]">>,
    typeof complexArrayStructure.shape.users.element
  >
>;

type _test_resolve_complex_array_contacts = Expect<
  Equal<
    ReturnType<
      typeof resolve<typeof complexArrayStructure, "users[].contacts">
    >,
    typeof complexArrayStructure.shape.users.element.shape.contacts
  >
>;

type _test_resolve_complex_array_contact_type = Expect<
  Equal<
    ReturnType<
      typeof resolve<typeof complexArrayStructure, "users[].contacts[].type">
    >,
    typeof complexArrayStructure.shape.users.element.shape.contacts.element.shape.type
  >
>;

// ============================================================================
// Tuple Type Resolution
// ============================================================================

const simpleTuple = z.tuple([z.string(), z.number(), z.boolean()]);

type _test_resolve_tuple_0 = Expect<
  Equal<
    ReturnType<typeof resolve<typeof simpleTuple, "[0]">>,
    (typeof simpleTuple.def.items)[0]
  >
>;

type _test_resolve_tuple_1 = Expect<
  Equal<
    ReturnType<typeof resolve<typeof simpleTuple, "[1]">>,
    (typeof simpleTuple.def.items)[1]
  >
>;

type _test_resolve_tuple_2 = Expect<
  Equal<
    ReturnType<typeof resolve<typeof simpleTuple, "[2]">>,
    (typeof simpleTuple.def.items)[2]
  >
>;

const tupleWithObjects = z.tuple([
  z.object({ name: z.string() }),
  z.object({ age: z.number() }),
]);

type _test_resolve_tuple_object_0 = Expect<
  Equal<
    ReturnType<typeof resolve<typeof tupleWithObjects, "[0]">>,
    (typeof tupleWithObjects.def.items)[0]
  >
>;

type _test_resolve_tuple_object_0_name = Expect<
  Equal<
    ReturnType<typeof resolve<typeof tupleWithObjects, "[0].name">>,
    (typeof tupleWithObjects.def.items)[0]["shape"]["name"]
  >
>;

const tupleWithArrays = z.tuple([z.array(z.string()), z.array(z.number())]);

type _test_resolve_tuple_array_0 = Expect<
  Equal<
    ReturnType<typeof resolve<typeof tupleWithArrays, "[0]">>,
    (typeof tupleWithArrays.def.items)[0]
  >
>;

type _test_resolve_tuple_array_0_element = Expect<
  Equal<
    ReturnType<typeof resolve<typeof tupleWithArrays, "[0][]">>,
    (typeof tupleWithArrays.def.items)[0]["element"]
  >
>;

const objectWithTuple = z.object({
  coordinates: z.tuple([z.number(), z.number()]),
});

type _test_resolve_object_tuple = Expect<
  Equal<
    ReturnType<typeof resolve<typeof objectWithTuple, "coordinates">>,
    typeof objectWithTuple.shape.coordinates
  >
>;

type _test_resolve_object_tuple_0 = Expect<
  Equal<
    ReturnType<typeof resolve<typeof objectWithTuple, "coordinates[0]">>,
    (typeof objectWithTuple.shape.coordinates.def.items)[0]
  >
>;

// ============================================================================
// Union Type Resolution
// ============================================================================

// Union of primitives has no properties to resolve

const unionWithCommonFields = z.union([
  z.object({ type: z.literal("a"), value: z.string() }),
  z.object({ type: z.literal("b"), value: z.number() }),
]);

// For unions, resolve returns a union type
type ResolvedUnionType = ReturnType<
  typeof resolve<typeof unionWithCommonFields, "type">
>;

// The resolved type should be a ZodUnion
type _test_resolve_union_type_is_union = Expect<
  Equal<ResolvedUnionType["_zod"]["def"]["type"], "union">
>;

const unionWithDifferentFields = z.union([
  z.object({ name: z.string(), age: z.number() }),
  z.object({ title: z.string(), count: z.number() }),
]);

// Fields unique to one branch are resolved to that branch's type
type _test_resolve_union_name = ReturnType<
  typeof resolve<typeof unionWithDifferentFields, "name">
>;

type _test_resolve_union_title = ReturnType<
  typeof resolve<typeof unionWithDifferentFields, "title">
>;

const discriminatedUnion = z.union([
  z.object({
    type: z.literal("car"),
    doors: z.number(),
    wheels: z.number(),
  }),
  z.object({
    type: z.literal("bike"),
    wheels: z.number(),
  }),
  z.object({
    type: z.literal("plane"),
    wings: z.number(),
  }),
]);

type _test_resolve_discriminated_type = ReturnType<
  typeof resolve<typeof discriminatedUnion, "type">
>;

// wheels exists in car and bike, so it's a union
type _test_resolve_discriminated_wheels = ReturnType<
  typeof resolve<typeof discriminatedUnion, "wheels">
>;

// doors only exists in car
type _test_resolve_discriminated_doors = ReturnType<
  typeof resolve<typeof discriminatedUnion, "doors">
>;

// wings only exists in plane
type _test_resolve_discriminated_wings = ReturnType<
  typeof resolve<typeof discriminatedUnion, "wings">
>;

const unionWithNestedObjects = z.union([
  z.object({
    type: z.literal("person"),
    data: z.object({
      name: z.string(),
      age: z.number(),
    }),
  }),
  z.object({
    type: z.literal("company"),
    data: z.object({
      companyName: z.string(),
      employees: z.number(),
    }),
  }),
]);

type _test_resolve_union_nested_data = ReturnType<
  typeof resolve<typeof unionWithNestedObjects, "data">
>;

type _test_resolve_union_nested_name = ReturnType<
  typeof resolve<typeof unionWithNestedObjects, "data.name">
>;

type _test_resolve_union_nested_company = ReturnType<
  typeof resolve<typeof unionWithNestedObjects, "data.companyName">
>;

// ============================================================================
// Optional and Nullable Type Resolution
// ============================================================================

const optionalFields = z.object({
  name: z.string().optional(),
  age: z.number().optional(),
});

type _test_resolve_optional_name = Expect<
  Equal<
    ReturnType<typeof resolve<typeof optionalFields, "name">>,
    typeof optionalFields.shape.name
  >
>;

// The resolved type should have type "optional"
type _test_resolve_optional_def = Expect<
  Equal<
    ReturnType<typeof resolve<typeof optionalFields, "name">>["def"]["type"],
    "optional"
  >
>;

const nullableFields = z.object({
  email: z.string().nullable(),
  phone: z.string().nullable(),
});

type _test_resolve_nullable_email = Expect<
  Equal<
    ReturnType<typeof resolve<typeof nullableFields, "email">>,
    typeof nullableFields.shape.email
  >
>;

type _test_resolve_nullable_def = Expect<
  Equal<
    ReturnType<typeof resolve<typeof nullableFields, "email">>["def"]["type"],
    "nullable"
  >
>;

const optionalNestedObject = z.object({
  user: z
    .object({
      name: z.string(),
      email: z.string(),
    })
    .optional(),
});

type _test_resolve_optional_nested_user = Expect<
  Equal<
    ReturnType<typeof resolve<typeof optionalNestedObject, "user">>,
    typeof optionalNestedObject.shape.user
  >
>;

type _test_resolve_optional_nested_name = Expect<
  Equal<
    ReturnType<typeof resolve<typeof optionalNestedObject, "user.name">>,
    z.ZodString
  >
>;

const nullableArray = z.object({
  tags: z.array(z.string()).nullable(),
});

type _test_resolve_nullable_array = Expect<
  Equal<
    ReturnType<typeof resolve<typeof nullableArray, "tags">>,
    typeof nullableArray.shape.tags
  >
>;

type _test_resolve_nullable_array_element = Expect<
  Equal<ReturnType<typeof resolve<typeof nullableArray, "tags[]">>, z.ZodString>
>;

// ============================================================================
// Default Type Resolution
// ============================================================================

const defaultFields = z.object({
  name: z.string().default("John"),
  age: z.number().default(0),
});

type _test_resolve_default_name = Expect<
  Equal<
    ReturnType<typeof resolve<typeof defaultFields, "name">>,
    typeof defaultFields.shape.name
  >
>;

// The resolved type should have type "default"
type _test_resolve_default_def = Expect<
  Equal<
    ReturnType<typeof resolve<typeof defaultFields, "name">>["def"]["type"],
    "default"
  >
>;

const defaultNestedObject = z.object({
  user: z
    .object({
      name: z.string(),
      email: z.string(),
    })
    .default({ name: "John", email: "john@example.com" }),
});

type _test_resolve_default_nested_user = Expect<
  Equal<
    ReturnType<typeof resolve<typeof defaultNestedObject, "user">>,
    typeof defaultNestedObject.shape.user
  >
>;

type _test_resolve_default_nested_name = Expect<
  Equal<
    ReturnType<typeof resolve<typeof defaultNestedObject, "user.name">>,
    z.ZodString
  >
>;

type _test_resolve_default_nested_email = Expect<
  Equal<
    ReturnType<typeof resolve<typeof defaultNestedObject, "user.email">>,
    z.ZodString
  >
>;

const defaultArray = z.object({
  tags: z.array(z.string()).default([]),
});

type _test_resolve_default_array = Expect<
  Equal<
    ReturnType<typeof resolve<typeof defaultArray, "tags">>,
    typeof defaultArray.shape.tags
  >
>;

type _test_resolve_default_array_element = Expect<
  Equal<ReturnType<typeof resolve<typeof defaultArray, "tags[]">>, z.ZodString>
>;

const defaultWithOptional = z.object({
  data: z
    .object({
      value: z.string(),
      count: z.number(),
    })
    .default({ value: "default", count: 0 })
    .optional(),
});

type _test_resolve_default_optional_data = Expect<
  Equal<
    ReturnType<typeof resolve<typeof defaultWithOptional, "data">>,
    typeof defaultWithOptional.shape.data
  >
>;

type _test_resolve_default_optional_value = Expect<
  Equal<
    ReturnType<typeof resolve<typeof defaultWithOptional, "data.value">>,
    z.ZodString
  >
>;

const defaultWithNullable = z.object({
  config: z
    .object({
      enabled: z.boolean(),
      timeout: z.number(),
    })
    .default({ enabled: true, timeout: 5000 })
    .nullable(),
});

type _test_resolve_default_nullable_config = Expect<
  Equal<
    ReturnType<typeof resolve<typeof defaultWithNullable, "config">>,
    typeof defaultWithNullable.shape.config
  >
>;

type _test_resolve_default_nullable_enabled = Expect<
  Equal<
    ReturnType<typeof resolve<typeof defaultWithNullable, "config.enabled">>,
    z.ZodBoolean
  >
>;

const defaultOptionalNullable = z.object({
  settings: z
    .object({
      theme: z.string(),
      fontSize: z.number(),
    })
    .default({ theme: "light", fontSize: 14 })
    .optional()
    .nullable(),
});

type _test_resolve_default_optional_nullable_settings = Expect<
  Equal<
    ReturnType<typeof resolve<typeof defaultOptionalNullable, "settings">>,
    typeof defaultOptionalNullable.shape.settings
  >
>;

type _test_resolve_default_optional_nullable_theme = Expect<
  Equal<
    ReturnType<
      typeof resolve<typeof defaultOptionalNullable, "settings.theme">
    >,
    z.ZodString
  >
>;

type _test_resolve_default_optional_nullable_fontSize = Expect<
  Equal<
    ReturnType<
      typeof resolve<typeof defaultOptionalNullable, "settings.fontSize">
    >,
    z.ZodNumber
  >
>;

const defaultArrayOfObjects = z.object({
  items: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().default("Unnamed"),
      })
    )
    .default([]),
});

type _test_resolve_default_array_of_objects = Expect<
  Equal<
    ReturnType<typeof resolve<typeof defaultArrayOfObjects, "items">>,
    typeof defaultArrayOfObjects.shape.items
  >
>;

type _test_resolve_default_array_of_objects_element = Expect<
  Equal<
    ReturnType<typeof resolve<typeof defaultArrayOfObjects, "items[]">>,
    z.ZodObject<{
      id: z.ZodString;
      name: z.ZodDefault<z.ZodString>;
    }>
  >
>;

type _test_resolve_default_array_of_objects_id = Expect<
  Equal<
    ReturnType<typeof resolve<typeof defaultArrayOfObjects, "items[].id">>,
    z.ZodString
  >
>;

type _test_resolve_default_array_of_objects_name = Expect<
  Equal<
    ReturnType<typeof resolve<typeof defaultArrayOfObjects, "items[].name">>,
    z.ZodDefault<z.ZodString>
  >
>;

const deeplyNestedDefaults = z.object({
  config: z
    .object({
      database: z
        .object({
          host: z.string().default("localhost"),
          port: z.number().default(5432),
          credentials: z
            .object({
              username: z.string(),
              password: z.string(),
            })
            .default({ username: "admin", password: "admin" }),
        })
        .default({
          host: "localhost",
          port: 5432,
          credentials: { username: "admin", password: "admin" },
        }),
    })
    .default({
      database: {
        host: "localhost",
        port: 5432,
        credentials: { username: "admin", password: "admin" },
      },
    }),
});

type _test_resolve_deeply_nested_defaults_config = Expect<
  Equal<
    ReturnType<typeof resolve<typeof deeplyNestedDefaults, "config">>,
    typeof deeplyNestedDefaults.shape.config
  >
>;

type _test_resolve_deeply_nested_defaults_database = Expect<
  Equal<
    ReturnType<typeof resolve<typeof deeplyNestedDefaults, "config.database">>,
    z.ZodDefault<
      z.ZodObject<{
        host: z.ZodDefault<z.ZodString>;
        port: z.ZodDefault<z.ZodNumber>;
        credentials: z.ZodDefault<
          z.ZodObject<{
            username: z.ZodString;
            password: z.ZodString;
          }>
        >;
      }>
    >
  >
>;

type _test_resolve_deeply_nested_defaults_host = Expect<
  Equal<
    ReturnType<
      typeof resolve<typeof deeplyNestedDefaults, "config.database.host">
    >,
    z.ZodDefault<z.ZodString>
  >
>;

type _test_resolve_deeply_nested_defaults_credentials = Expect<
  Equal<
    ReturnType<
      typeof resolve<typeof deeplyNestedDefaults, "config.database.credentials">
    >,
    z.ZodDefault<
      z.ZodObject<{
        username: z.ZodString;
        password: z.ZodString;
      }>
    >
  >
>;

type _test_resolve_deeply_nested_defaults_username = Expect<
  Equal<
    ReturnType<
      typeof resolve<
        typeof deeplyNestedDefaults,
        "config.database.credentials.username"
      >
    >,
    z.ZodString
  >
>;

// ============================================================================
// Complex Nested Type Resolution
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

type _test_resolve_person_id = Expect<
  Equal<ReturnType<typeof resolve<typeof person, "id">>, typeof person.shape.id>
>;

type _test_resolve_person_birth = Expect<
  Equal<
    ReturnType<typeof resolve<typeof person, "birth">>,
    typeof person.shape.birth
  >
>;

type _test_resolve_person_birth_date = Expect<
  Equal<
    ReturnType<typeof resolve<typeof person, "birth.date">>,
    typeof person.shape.birth.shape.date
  >
>;

const personOptional = person.optional();

type _test_resolve_person_optional = ReturnType<
  typeof resolve<typeof personOptional, "id">
>;

const group = z.array(personOptional);

type _test_resolve_group_element = ReturnType<
  typeof resolve<typeof group, "[]">
>;

type _test_resolve_group_id = ReturnType<typeof resolve<typeof group, "[].id">>;

type _test_resolve_group_birth_date = ReturnType<
  typeof resolve<typeof group, "[].birth.date">
>;

const family = z.object({
  parents: z.array(personOptional),
  children: z.array(personOptional),
});

type _test_resolve_family_parents = Expect<
  Equal<
    ReturnType<typeof resolve<typeof family, "parents">>,
    typeof family.shape.parents
  >
>;

type _test_resolve_family_parent_element = ReturnType<
  typeof resolve<typeof family, "parents[]">
>;

type _test_resolve_family_parent_name = ReturnType<
  typeof resolve<typeof family, "parents[].name">
>;

type _test_resolve_family_child_birth_place = ReturnType<
  typeof resolve<typeof family, "children[].birth.place">
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

type _test_resolve_complex_id = Expect<
  Equal<
    ReturnType<typeof resolve<typeof complexSchema, "id">>,
    typeof complexSchema.shape.id
  >
>;

type _test_resolve_complex_metadata = Expect<
  Equal<
    ReturnType<typeof resolve<typeof complexSchema, "metadata">>,
    typeof complexSchema.shape.metadata
  >
>;

type _test_resolve_complex_metadata_created = Expect<
  Equal<
    ReturnType<typeof resolve<typeof complexSchema, "metadata.created">>,
    typeof complexSchema.shape.metadata.shape.created
  >
>;

type _test_resolve_complex_items = Expect<
  Equal<
    ReturnType<typeof resolve<typeof complexSchema, "items">>,
    typeof complexSchema.shape.items
  >
>;

type _test_resolve_complex_items_element = Expect<
  Equal<
    ReturnType<typeof resolve<typeof complexSchema, "items[]">>,
    typeof complexSchema.shape.items.element
  >
>;

type _test_resolve_complex_items_name = Expect<
  Equal<
    ReturnType<typeof resolve<typeof complexSchema, "items[].name">>,
    typeof complexSchema.shape.items.element.shape.name
  >
>;

type _test_resolve_complex_items_tags = Expect<
  Equal<
    ReturnType<typeof resolve<typeof complexSchema, "items[].tags">>,
    typeof complexSchema.shape.items.element.shape.tags
  >
>;

type _test_resolve_complex_items_tags_element = Expect<
  Equal<
    ReturnType<typeof resolve<typeof complexSchema, "items[].tags[]">>,
    typeof complexSchema.shape.items.element.shape.tags.element
  >
>;

type _test_resolve_complex_coordinates = Expect<
  Equal<
    ReturnType<typeof resolve<typeof complexSchema, "coordinates">>,
    typeof complexSchema.shape.coordinates
  >
>;

type _test_resolve_complex_coordinates_0 = Expect<
  Equal<
    ReturnType<typeof resolve<typeof complexSchema, "coordinates[0]">>,
    (typeof complexSchema.shape.coordinates.def.items)[0]
  >
>;

type _test_resolve_complex_status = Expect<
  Equal<
    ReturnType<typeof resolve<typeof complexSchema, "status">>,
    typeof complexSchema.shape.status
  >
>;

// ============================================================================
// Real-world Example: API Response Type Resolution
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
});

type _test_api_success = Expect<
  Equal<
    ReturnType<typeof resolve<typeof apiResponse, "success">>,
    typeof apiResponse.shape.success
  >
>;

type _test_api_user_id = Expect<
  Equal<
    ReturnType<typeof resolve<typeof apiResponse, "data.user.id">>,
    typeof apiResponse.shape.data.shape.user.shape.id
  >
>;

type _test_api_profile_name = Expect<
  Equal<
    ReturnType<typeof resolve<typeof apiResponse, "data.user.profile.name">>,
    typeof apiResponse.shape.data.shape.user.shape.profile.shape.name
  >
>;

type _test_api_notifications_email = Expect<
  Equal<
    ReturnType<
      typeof resolve<
        typeof apiResponse,
        "data.user.settings.notifications.email"
      >
    >,
    typeof apiResponse.shape.data.shape.user.shape.settings.shape.notifications.shape.email
  >
>;

type _test_api_posts = Expect<
  Equal<
    ReturnType<typeof resolve<typeof apiResponse, "data.posts">>,
    typeof apiResponse.shape.data.shape.posts
  >
>;

type _test_api_post = Expect<
  Equal<
    ReturnType<typeof resolve<typeof apiResponse, "data.posts[]">>,
    typeof apiResponse.shape.data.shape.posts.element
  >
>;

type _test_api_post_title = Expect<
  Equal<
    ReturnType<typeof resolve<typeof apiResponse, "data.posts[].title">>,
    typeof apiResponse.shape.data.shape.posts.element.shape.title
  >
>;

type _test_api_post_tags = Expect<
  Equal<
    ReturnType<typeof resolve<typeof apiResponse, "data.posts[].tags">>,
    typeof apiResponse.shape.data.shape.posts.element.shape.tags
  >
>;

type _test_api_post_tag = Expect<
  Equal<
    ReturnType<typeof resolve<typeof apiResponse, "data.posts[].tags[]">>,
    typeof apiResponse.shape.data.shape.posts.element.shape.tags.element
  >
>;

type _test_api_post_author_name = Expect<
  Equal<
    ReturnType<typeof resolve<typeof apiResponse, "data.posts[].author.name">>,
    typeof apiResponse.shape.data.shape.posts.element.shape.author.shape.name
  >
>;

// ============================================================================
// Type Validation: Ensure resolved schemas can parse correct types
// ============================================================================

const validateSimple = z.object({
  name: z.string(),
  age: z.number(),
});

type ValidateSimpleName = ReturnType<
  ReturnType<typeof resolve<typeof validateSimple, "name">>["parse"]
>;

type _test_validate_simple_name = Expect<Equal<ValidateSimpleName, string>>;

type ValidateSimpleAge = ReturnType<
  ReturnType<typeof resolve<typeof validateSimple, "age">>["parse"]
>;

type _test_validate_simple_age = Expect<Equal<ValidateSimpleAge, number>>;

const validateNested = z.object({
  user: z.object({
    name: z.string(),
    age: z.number(),
  }),
});

type ValidateNestedUserName = ReturnType<
  ReturnType<typeof resolve<typeof validateNested, "user.name">>["parse"]
>;

type _test_validate_nested_name = Expect<Equal<ValidateNestedUserName, string>>;

const validateArray = z.array(z.object({ id: z.string() }));

type ValidateArrayElement = ReturnType<
  ReturnType<typeof resolve<typeof validateArray, "[]">>["parse"]
>;

type _test_validate_array_element = Expect<
  Equal<ValidateArrayElement, { id: string }>
>;

type ValidateArrayId = ReturnType<
  ReturnType<typeof resolve<typeof validateArray, "[].id">>["parse"]
>;

type _test_validate_array_id = Expect<Equal<ValidateArrayId, string>>;
