/**
 * Main type test file - imports and re-exports specialized type tests
 *
 * This file serves as an entry point for all type tests.
 * For detailed type tests, see:
 * - flatten.type-test.ts: Tests that all deep keys are correctly resolved
 * - resolve.type-test.ts: Tests that all deep types are correctly resolved
 */

// Import type tests to ensure they're checked
import "./flatten.type-test";
import "./resolve.type-test";

import { z } from "zod/v4";
import { FlattenSchema } from "../src/types";
import { resolve } from "../src/resolve";
import { Expect, Equal } from "type-testing";

// ============================================================================
// Quick Integration Tests
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

// Test FlattenSchema produces correct keys
type PersonFlattened = FlattenSchema<typeof person>;

type _test_person_keys = Expect<
  Equal<
    keyof PersonFlattened,
    "id" | "email" | "name" | "age" | "birth" | "birth.date" | "birth.place"
  >
>;

// Test resolve() returns correct types
type _test_resolve_id = Expect<
  Equal<ReturnType<typeof resolve<typeof person, "id">>, typeof person.shape.id>
>;

type _test_resolve_birth_date = Expect<
  Equal<
    ReturnType<typeof resolve<typeof person, "birth.date">>,
    typeof person.shape.birth.shape.date
  >
>;

// Test with optional
const personOptional = person.optional();

type PersonOptionalFlattened = FlattenSchema<typeof personOptional>;

type _test_person_optional_keys = Expect<
  Equal<
    keyof PersonOptionalFlattened,
    "id" | "email" | "name" | "age" | "birth" | "birth.date" | "birth.place"
  >
>;

// Test with arrays
const group = z.array(personOptional);

type GroupFlattened = FlattenSchema<typeof group>;

type _test_group_keys = Expect<
  Equal<
    keyof GroupFlattened,
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

type _test_resolve_group_element = ReturnType<
  typeof resolve<typeof group, "[]">
>;

type _test_resolve_group_birth_date = ReturnType<
  typeof resolve<typeof group, "[].birth.date">
>;

// Test with nested arrays in objects
const family = z.object({
  parents: z.array(personOptional),
  children: z.array(personOptional),
});

type FamilyFlattened = FlattenSchema<typeof family>;

type _test_family_keys = Expect<
  Equal<
    keyof FamilyFlattened,
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

type _test_resolve_parent_name = ReturnType<
  typeof resolve<typeof family, "parents[].name">
>;

// Test with tuples
const animals = z.tuple([z.literal("pet"), z.literal("food")]);

type AnimalsFlattened = FlattenSchema<typeof animals>;

type _test_animals_keys = Expect<Equal<keyof AnimalsFlattened, "[0]" | "[1]">>;

type _test_resolve_animal_0 = Expect<
  Equal<
    ReturnType<typeof resolve<typeof animals, "[0]">>,
    (typeof animals.def.items)[0]
  >
>;

// Test with unions (discriminated)
const vehicle = z.union([
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

type VehicleFlattened = FlattenSchema<typeof vehicle>;

type _test_vehicle_keys = Expect<
  Equal<
    keyof VehicleFlattened,
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

type _test_resolve_vehicle_type = ReturnType<
  typeof resolve<typeof vehicle, "type">
>;

type _test_resolve_vehicle_wheels = ReturnType<
  typeof resolve<typeof vehicle, "wheels">
>;

// Test with complex nested structures
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

type ComplexFlattened = FlattenSchema<typeof complexSchema>;

type _test_complex_keys = Expect<
  Equal<
    keyof ComplexFlattened,
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

type _test_resolve_complex_metadata_created = Expect<
  Equal<
    ReturnType<typeof resolve<typeof complexSchema, "metadata.created">>,
    typeof complexSchema.shape.metadata.shape.created
  >
>;

type _test_resolve_complex_items_tags = Expect<
  Equal<
    ReturnType<typeof resolve<typeof complexSchema, "items[].tags[]">>,
    typeof complexSchema.shape.items.element.shape.tags.element
  >
>;

// ============================================================================
// Edge Cases
// ============================================================================

// Empty object
const emptyObject = z.object({});
type EmptyFlattened = FlattenSchema<typeof emptyObject>;
type _test_empty = Expect<Equal<keyof EmptyFlattened, never>>;

// Empty tuple
const emptyTuple = z.tuple([]);
type EmptyTupleFlattened = FlattenSchema<typeof emptyTuple>;
type _test_empty_tuple = Expect<Equal<keyof EmptyTupleFlattened, never>>;

// Deeply nested arrays
const deepArrays = z.array(z.array(z.array(z.string())));
type DeepArraysFlattened = FlattenSchema<typeof deepArrays>;
type _test_deep_arrays = Expect<
  Equal<keyof DeepArraysFlattened, "[]" | "[][]" | "[][][]">
>;

// ============================================================================
// Type Safety: Autocomplete and Type Inference
// ============================================================================

/**
 * These tests demonstrate that TypeScript will provide autocomplete
 * for all flattened keys when using resolve()
 */

const demoSchema = z.object({
  user: z.object({
    profile: z.object({
      name: z.string(),
      email: z.string(),
    }),
    posts: z.array(
      z.object({
        title: z.string(),
        tags: z.array(z.string()),
      })
    ),
  }),
});

// All of these should autocomplete and type-check correctly
type ValidKey1 = "user";
type ValidKey2 = "user.profile";
type ValidKey3 = "user.profile.name";
type ValidKey4 = "user.posts";
type ValidKey5 = "user.posts[]";
type ValidKey6 = "user.posts[].title";
type ValidKey7 = "user.posts[].tags";
type ValidKey8 = "user.posts[].tags[]";

// Verify all keys are valid
type AllDemoKeys = keyof FlattenSchema<typeof demoSchema>;

type _test_valid_key_1 = Expect<
  Equal<ValidKey1 extends AllDemoKeys ? true : false, true>
>;
type _test_valid_key_2 = Expect<
  Equal<ValidKey2 extends AllDemoKeys ? true : false, true>
>;
type _test_valid_key_3 = Expect<
  Equal<ValidKey3 extends AllDemoKeys ? true : false, true>
>;
type _test_valid_key_4 = Expect<
  Equal<ValidKey4 extends AllDemoKeys ? true : false, true>
>;
type _test_valid_key_5 = Expect<
  Equal<ValidKey5 extends AllDemoKeys ? true : false, true>
>;
type _test_valid_key_6 = Expect<
  Equal<ValidKey6 extends AllDemoKeys ? true : false, true>
>;
type _test_valid_key_7 = Expect<
  Equal<ValidKey7 extends AllDemoKeys ? true : false, true>
>;
type _test_valid_key_8 = Expect<
  Equal<ValidKey8 extends AllDemoKeys ? true : false, true>
>;

// Invalid keys should not be in the type
type InvalidKey = "user.invalid";
type _test_invalid_key = Expect<
  Equal<InvalidKey extends AllDemoKeys ? true : false, false>
>;
