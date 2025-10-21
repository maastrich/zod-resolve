import { describe, expect, test } from "bun:test";
import { z, ZodUnion } from "zod/v4";
import { resolve } from "../src/resolve";

describe("resolve", () => {
  describe("basic object property access", () => {
    test("should resolve top-level properties", () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
        email: z.string(),
      });

      const nameSchema = resolve(schema, "name");
      const ageSchema = resolve(schema, "age");
      const emailSchema = resolve(schema, "email");

      expect(nameSchema).toBe(schema.shape.name);
      expect(ageSchema).toBe(schema.shape.age);
      expect(emailSchema).toBe(schema.shape.email);
    });

    test("should resolve nested object properties", () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
          email: z.string(),
        }),
      });

      const userSchema = resolve(schema, "user");
      const nameSchema = resolve(schema, "user.name");
      const emailSchema = resolve(schema, "user.email");

      expect(userSchema).toBe(schema.shape.user);
      expect(nameSchema).toBe(schema.shape.user.shape.name);
      expect(emailSchema).toBe(schema.shape.user.shape.email);
    });

    test("should resolve deeply nested properties", () => {
      const schema = z.object({
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

      const streetSchema = resolve(schema, "company.address.street");
      const countryNameSchema = resolve(schema, "company.address.country.name");

      expect(streetSchema).toBe(
        schema.shape.company.shape.address.shape.street,
      );
      expect(countryNameSchema).toBe(
        schema.shape.company.shape.address.shape.country.shape.name,
      );
    });
  });

  describe("array access", () => {
    test("should resolve array element schema", () => {
      const schema = z.array(z.string());

      const elementSchema = resolve(schema, "[]");

      expect(elementSchema).toBe(schema.element);
      expect(elementSchema.def.type).toBe("string");
    });

    test("should resolve array of objects", () => {
      const schema = z.array(
        z.object({
          id: z.string(),
          name: z.string(),
        }),
      );

      const elementSchema = resolve(schema, "[]");
      const idSchema = resolve(schema, "[].id");
      const nameSchema = resolve(schema, "[].name");

      expect(elementSchema).toBe(schema.element);
      expect(idSchema).toBe(schema.element.shape.id);
      expect(nameSchema).toBe(schema.element.shape.name);
    });

    test("should resolve nested arrays", () => {
      const schema = z.array(z.array(z.number()));

      const innerArraySchema = resolve(schema, "[]");
      const elementSchema = resolve(schema, "[][]");

      expect(innerArraySchema).toBe(schema.element);
      expect(elementSchema).toBe(schema.element.element);
      expect(elementSchema.def.type).toBe("number");
    });

    test("should resolve object with array property", () => {
      const schema = z.object({
        items: z.array(z.string()),
        tags: z.array(z.number()),
      });

      const itemsSchema = resolve(schema, "items");
      const itemElementSchema = resolve(schema, "items[]");
      const tagElementSchema = resolve(schema, "tags[]");

      expect(itemsSchema).toBe(schema.shape.items);
      expect(itemElementSchema).toBe(schema.shape.items.element);
      expect(tagElementSchema).toBe(schema.shape.tags.element);
    });

    test("should resolve nested object arrays", () => {
      const schema = z.object({
        users: z.array(
          z.object({
            name: z.string(),
            contacts: z.array(
              z.object({
                type: z.string(),
                value: z.string(),
              }),
            ),
          }),
        ),
      });

      const userElementSchema = resolve(schema, "users[]");
      const userNameSchema = resolve(schema, "users[].name");
      const contactsSchema = resolve(schema, "users[].contacts");
      const contactElementSchema = resolve(schema, "users[].contacts[]");
      const contactTypeSchema = resolve(schema, "users[].contacts[].type");

      expect(userElementSchema).toBe(schema.shape.users.element);
      expect(userNameSchema).toBe(schema.shape.users.element.shape.name);
      expect(contactsSchema).toBe(schema.shape.users.element.shape.contacts);
      expect(contactElementSchema).toBe(
        schema.shape.users.element.shape.contacts.element,
      );
      expect(contactTypeSchema).toBe(
        schema.shape.users.element.shape.contacts.element.shape.type,
      );
    });
  });

  describe("tuple access", () => {
    test("should resolve tuple elements by index", () => {
      const schema = z.tuple([z.string(), z.number(), z.boolean()]);

      const element0 = resolve(schema, "[0]");
      const element1 = resolve(schema, "[1]");
      const element2 = resolve(schema, "[2]");

      expect(element0).toBe(schema.def.items[0]);
      expect(element1).toBe(schema.def.items[1]);
      expect(element2).toBe(schema.def.items[2]);
      expect(element0.def.type).toBe("string");
      expect(element1.def.type).toBe("number");
      expect(element2.def.type).toBe("boolean");
    });

    test("should resolve tuple with object elements", () => {
      const schema = z.tuple([
        z.object({ name: z.string() }),
        z.object({ age: z.number() }),
      ]);

      const element0 = resolve(schema, "[0]");
      const element1 = resolve(schema, "[1]");
      const nameSchema = resolve(schema, "[0].name");
      const ageSchema = resolve(schema, "[1].age");

      expect(element0).toBe(schema.def.items[0]);
      expect(element1).toBe(schema.def.items[1]);
      expect(nameSchema).toBe(schema.def.items[0].shape.name);
      expect(ageSchema).toBe(schema.def.items[1].shape.age);
    });

    test("should resolve tuple with nested arrays", () => {
      const schema = z.tuple([z.array(z.string()), z.array(z.number())]);

      const array0 = resolve(schema, "[0]");
      const array1 = resolve(schema, "[1]");
      const element0 = resolve(schema, "[0][]");
      const element1 = resolve(schema, "[1][]");

      expect(array0).toBe(schema.def.items[0]);
      expect(array1).toBe(schema.def.items[1]);
      expect(element0).toBe(schema.def.items[0].element);
      expect(element1).toBe(schema.def.items[1].element);
    });

    test("should resolve object with tuple property", () => {
      const schema = z.object({
        coordinates: z.tuple([z.number(), z.number()]),
        location: z.tuple([z.string(), z.string(), z.string()]),
      });

      const coordinatesSchema = resolve(schema, "coordinates");
      const coord0 = resolve(schema, "coordinates[0]");
      const coord1 = resolve(schema, "coordinates[1]");
      const loc0 = resolve(schema, "location[0]");

      expect(coordinatesSchema).toBe(schema.shape.coordinates);
      expect(coord0).toBe(schema.shape.coordinates.def.items[0]);
      expect(coord1).toBe(schema.shape.coordinates.def.items[1]);
      expect(loc0).toBe(schema.shape.location.def.items[0]);
    });
  });

  describe("union access", () => {
    test("should resolve common fields in union", () => {
      const schema = z.union([
        z.object({ type: z.literal("a"), value: z.string() }),
        z.object({ type: z.literal("b"), value: z.number() }),
      ]);

      const typeSchema = resolve(schema, "type");
      const valueSchema = resolve(schema, "value");

      expect(typeSchema instanceof ZodUnion).toBe(true);
      expect(valueSchema instanceof ZodUnion).toBe(true);
      expect(typeSchema.options).toHaveLength(2);
      expect(valueSchema.options).toHaveLength(2);
    });

    test("should resolve all fields from union branches", () => {
      const schema = z.union([
        z.object({ name: z.string(), age: z.number() }),
        z.object({ title: z.string(), count: z.number() }),
      ]);

      const nameSchema = resolve(schema, "name");
      const ageSchema = resolve(schema, "age");
      const titleSchema = resolve(schema, "title");
      const countSchema = resolve(schema, "count");

      expect(nameSchema.def.type).toBe("string");
      expect(ageSchema.def.type).toBe("number");
      expect(titleSchema.def.type).toBe("string");
      expect(countSchema.def.type).toBe("number");
    });

    test("should resolve nested objects in union", () => {
      const schema = z.union([
        z.object({
          type: z.literal("person"),
          data: z.object({ name: z.string() }),
        }),
        z.object({
          type: z.literal("company"),
          data: z.object({ companyName: z.string() }),
        }),
      ]);

      const typeSchema = resolve(schema, "type");
      const dataSchema = resolve(schema, "data");
      const nameSchema = resolve(schema, "data.name");
      const companyNameSchema = resolve(schema, "data.companyName");

      expect(typeSchema instanceof ZodUnion).toBe(true);
      expect(dataSchema instanceof ZodUnion).toBe(true);
      expect(nameSchema.def.type).toBe("string");
      expect(companyNameSchema.def.type).toBe("string");
    });

    test("should resolve arrays in union", () => {
      const schema = z.union([
        z.object({ items: z.array(z.string()) }),
        z.object({ items: z.array(z.number()) }),
      ]);

      const itemsSchema = resolve(schema, "items");
      const elementSchema = resolve(schema, "items[]");

      expect(itemsSchema instanceof ZodUnion).toBe(true);
      expect(elementSchema instanceof ZodUnion).toBe(true);
    });

    test("should resolve discriminated union", () => {
      const schema = z.union([
        z.object({
          type: z.literal("car"),
          doors: z.number(),
          wheels: z.number(),
        }),
        z.object({
          type: z.literal("bike"),
          wheels: z.number(),
          gears: z.number(),
        }),
        z.object({
          type: z.literal("plane"),
          wings: z.number(),
          engines: z.number(),
        }),
      ]);

      const typeSchema = resolve(schema, "type");
      const wheelsSchema = resolve(schema, "wheels");
      const doorsSchema = resolve(schema, "doors");
      const gearsSchema = resolve(schema, "gears");
      const wingsSchema = resolve(schema, "wings");
      const enginesSchema = resolve(schema, "engines");

      expect(typeSchema instanceof ZodUnion).toBe(true);
      expect(typeSchema.options).toHaveLength(3);

      // wheels is in car and bike (2 branches)
      expect(wheelsSchema instanceof ZodUnion).toBe(true);
      expect(wheelsSchema.options).toHaveLength(2);

      // doors is only in car
      expect(doorsSchema.def.type).toBe("number");

      // gears is only in bike
      expect(gearsSchema.def.type).toBe("number");

      // wings is only in plane
      expect(wingsSchema.def.type).toBe("number");

      // engines is only in plane
      expect(enginesSchema.def.type).toBe("number");
    });
  });

  describe("optional and nullable schemas", () => {
    test("should resolve through optional wrapper", () => {
      const schema = z.object({
        name: z.string().optional(),
        age: z.number().optional(),
      });

      const nameSchema = resolve(schema, "name");
      const ageSchema = resolve(schema, "age");

      expect(nameSchema).toBe(schema.shape.name);
      expect(ageSchema).toBe(schema.shape.age);
      expect(nameSchema.def.type).toBe("optional");
      expect(ageSchema.def.type).toBe("optional");
    });

    test("should resolve through nullable wrapper", () => {
      const schema = z.object({
        email: z.string().nullable(),
        phone: z.string().nullable(),
      });

      const emailSchema = resolve(schema, "email");
      const phoneSchema = resolve(schema, "phone");

      expect(emailSchema).toBe(schema.shape.email);
      expect(phoneSchema).toBe(schema.shape.phone);
      expect(emailSchema.def.type).toBe("nullable");
      expect(phoneSchema.def.type).toBe("nullable");
    });

    test("should resolve nested optional objects", () => {
      const schema = z.object({
        user: z
          .object({
            name: z.string(),
            email: z.string(),
          })
          .optional(),
      });

      const userSchema = resolve(schema, "user");
      const nameSchema = resolve(schema, "user.name");
      const emailSchema = resolve(schema, "user.email");

      expect(userSchema).toBe(schema.shape.user);
      expect(userSchema.def.type).toBe("optional");
      expect(nameSchema.def.type).toBe("string");
      expect(emailSchema.def.type).toBe("string");
    });

    test("should resolve nullable arrays", () => {
      const schema = z.object({
        tags: z.array(z.string()).nullable(),
      });

      const tagsSchema = resolve(schema, "tags");
      const elementSchema = resolve(schema, "tags[]");

      expect(tagsSchema).toBe(schema.shape.tags);
      expect(tagsSchema.def.type).toBe("nullable");
      expect(elementSchema.def.type).toBe("string");
    });

    test("should resolve through both optional and nullable", () => {
      const schema = z.object({
        data: z
          .object({
            value: z.string(),
            count: z.number(),
          })
          .optional()
          .nullable(),
      });

      const dataSchema = resolve(schema, "data");
      const valueSchema = resolve(schema, "data.value");
      const countSchema = resolve(schema, "data.count");

      expect(dataSchema).toBe(schema.shape.data);
      expect(dataSchema.def.type).toBe("nullable");
      expect(valueSchema.def.type).toBe("string");
      expect(countSchema.def.type).toBe("number");
    });
  });

  describe("default schemas", () => {
    test("should resolve through default wrapper", () => {
      const schema = z.object({
        name: z.string().default("John"),
        age: z.number().default(0),
      });

      const nameSchema = resolve(schema, "name");
      const ageSchema = resolve(schema, "age");

      expect(nameSchema).toBe(schema.shape.name);
      expect(ageSchema).toBe(schema.shape.age);
      expect(nameSchema.def.type).toBe("default");
      expect(ageSchema.def.type).toBe("default");
    });

    test("should resolve nested default objects", () => {
      const schema = z.object({
        user: z
          .object({
            name: z.string(),
            email: z.string(),
          })
          .default({ name: "John", email: "john@example.com" }),
      });

      const userSchema = resolve(schema, "user");
      const nameSchema = resolve(schema, "user.name");
      const emailSchema = resolve(schema, "user.email");

      expect(userSchema).toBe(schema.shape.user);
      expect(userSchema.def.type).toBe("default");
      expect(nameSchema.def.type).toBe("string");
      expect(emailSchema.def.type).toBe("string");
    });

    test("should resolve default arrays", () => {
      const schema = z.object({
        tags: z.array(z.string()).default([]),
      });

      const tagsSchema = resolve(schema, "tags");
      const elementSchema = resolve(schema, "tags[]");

      expect(tagsSchema).toBe(schema.shape.tags);
      expect(tagsSchema.def.type).toBe("default");
      expect(elementSchema.def.type).toBe("string");
    });

    test("should resolve through default combined with optional", () => {
      const schema = z.object({
        data: z
          .object({
            value: z.string(),
            count: z.number(),
          })
          .default({ value: "default", count: 0 })
          .optional(),
      });

      const dataSchema = resolve(schema, "data");
      const valueSchema = resolve(schema, "data.value");
      const countSchema = resolve(schema, "data.count");

      expect(dataSchema).toBe(schema.shape.data);
      expect(dataSchema.def.type).toBe("optional");
      expect(valueSchema.def.type).toBe("string");
      expect(countSchema.def.type).toBe("number");
    });

    test("should resolve through default combined with nullable", () => {
      const schema = z.object({
        config: z
          .object({
            enabled: z.boolean(),
            timeout: z.number(),
          })
          .default({ enabled: true, timeout: 5000 })
          .nullable(),
      });

      const configSchema = resolve(schema, "config");
      const enabledSchema = resolve(schema, "config.enabled");
      const timeoutSchema = resolve(schema, "config.timeout");

      expect(configSchema).toBe(schema.shape.config);
      expect(configSchema.def.type).toBe("nullable");
      expect(enabledSchema.def.type).toBe("boolean");
      expect(timeoutSchema.def.type).toBe("number");
    });

    test("should resolve through default, optional, and nullable", () => {
      const schema = z.object({
        settings: z
          .object({
            theme: z.string(),
            fontSize: z.number(),
          })
          .default({ theme: "light", fontSize: 14 })
          .optional()
          .nullable(),
      });

      const settingsSchema = resolve(schema, "settings");
      const themeSchema = resolve(schema, "settings.theme");
      const fontSizeSchema = resolve(schema, "settings.fontSize");

      expect(settingsSchema).toBe(schema.shape.settings);
      expect(settingsSchema.def.type).toBe("nullable");
      expect(themeSchema.def.type).toBe("string");
      expect(fontSizeSchema.def.type).toBe("number");
    });

    test("should resolve array of objects with default values", () => {
      const schema = z.object({
        items: z
          .array(
            z.object({
              id: z.string(),
              name: z.string().default("Unnamed"),
            }),
          )
          .default([]),
      });

      const itemsSchema = resolve(schema, "items");
      const itemSchema = resolve(schema, "items[]");
      const idSchema = resolve(schema, "items[].id");
      const nameSchema = resolve(schema, "items[].name");

      expect(itemsSchema).toBe(schema.shape.items);
      expect(itemsSchema.def.type).toBe("default");
      expect(itemSchema.def.type).toBe("object");
      expect(idSchema.def.type).toBe("string");
      expect(nameSchema.def.type).toBe("default");
    });

    test("should resolve deeply nested structures with default values", () => {
      const schema = z.object({
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

      const configSchema = resolve(schema, "config");
      const databaseSchema = resolve(schema, "config.database");
      const hostSchema = resolve(schema, "config.database.host");
      const portSchema = resolve(schema, "config.database.port");
      const credentialsSchema = resolve(schema, "config.database.credentials");
      const usernameSchema = resolve(
        schema,
        "config.database.credentials.username",
      );
      const passwordSchema = resolve(
        schema,
        "config.database.credentials.password",
      );

      expect(configSchema.def.type).toBe("default");
      expect(databaseSchema.def.type).toBe("default");
      expect(hostSchema.def.type).toBe("default");
      expect(portSchema.def.type).toBe("default");
      expect(credentialsSchema.def.type).toBe("default");
      expect(usernameSchema.def.type).toBe("string");
      expect(passwordSchema.def.type).toBe("string");
    });
  });

  describe("complex nested schemas", () => {
    test("should resolve all paths in complex schema", () => {
      const schema = z.object({
        id: z.string(),
        metadata: z.object({
          created: z.string(),
          updated: z.string().optional(),
        }),
        items: z.array(
          z.object({
            name: z.string(),
            tags: z.array(z.string()),
          }),
        ),
        coordinates: z.tuple([z.number(), z.number()]),
        status: z.union([z.literal("active"), z.literal("inactive")]),
      });

      // Top level
      expect(resolve(schema, "id")).toBe(schema.shape.id);
      expect(resolve(schema, "metadata")).toBe(schema.shape.metadata);
      expect(resolve(schema, "items")).toBe(schema.shape.items);
      expect(resolve(schema, "coordinates")).toBe(schema.shape.coordinates);
      expect(resolve(schema, "status")).toBe(schema.shape.status);

      // Nested object
      expect(resolve(schema, "metadata.created")).toBe(
        schema.shape.metadata.shape.created,
      );
      expect(resolve(schema, "metadata.updated")).toBe(
        schema.shape.metadata.shape.updated,
      );

      // Array paths
      expect(resolve(schema, "items[]")).toBe(schema.shape.items.element);
      expect(resolve(schema, "items[].name")).toBe(
        schema.shape.items.element.shape.name,
      );
      expect(resolve(schema, "items[].tags")).toBe(
        schema.shape.items.element.shape.tags,
      );
      expect(resolve(schema, "items[].tags[]")).toBe(
        schema.shape.items.element.shape.tags.element,
      );

      // Tuple paths
      expect(resolve(schema, "coordinates[0]")).toBe(
        schema.shape.coordinates.def.items[0],
      );
      expect(resolve(schema, "coordinates[1]")).toBe(
        schema.shape.coordinates.def.items[1],
      );
    });

    test("should resolve deeply nested optional structures", () => {
      const schema = z.object({
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
                }),
              )
              .nullable(),
          })
          .optional(),
      });

      expect(resolve(schema, "user").def.type).toBe("optional");
      expect(resolve(schema, "user.profile").def.type).toBe("optional");
      expect(resolve(schema, "user.profile.bio").def.type).toBe("string");
      expect(resolve(schema, "user.profile.avatar").def.type).toBe("optional");
      expect(resolve(schema, "user.profile.social").def.type).toBe("nullable");
      expect(resolve(schema, "user.profile.social.twitter").def.type).toBe(
        "string",
      );
      expect(resolve(schema, "user.contacts").def.type).toBe("nullable");
      expect(resolve(schema, "user.contacts[]").def.type).toBe("object");
      expect(resolve(schema, "user.contacts[].type").def.type).toBe("string");
    });

    test("should resolve complex union with nested structures", () => {
      const schema = z.union([
        z.object({
          type: z.literal("user"),
          data: z.object({
            name: z.string(),
            contacts: z.array(z.string()),
          }),
        }),
        z.object({
          type: z.literal("admin"),
          data: z.object({
            name: z.string(),
            permissions: z.array(z.string()),
          }),
        }),
      ]);

      const typeSchema = resolve(schema, "type");
      const dataSchema = resolve(schema, "data");
      const nameSchema = resolve(schema, "data.name");
      const contactsSchema = resolve(schema, "data.contacts");
      const permissionsSchema = resolve(schema, "data.permissions");
      const contactsElementSchema = resolve(schema, "data.contacts[]");
      const permissionsElementSchema = resolve(schema, "data.permissions[]");

      expect(typeSchema instanceof ZodUnion).toBe(true);
      expect(dataSchema instanceof ZodUnion).toBe(true);
      expect(nameSchema instanceof ZodUnion).toBe(true);
      // contacts and permissions are each unique to one branch, so they merge as unions
      expect(
        contactsSchema instanceof ZodUnion ||
          contactsSchema.def.type === "array",
      ).toBe(true);
      expect(
        permissionsSchema instanceof ZodUnion ||
          permissionsSchema.def.type === "array",
      ).toBe(true);
      expect(contactsElementSchema.def.type).toBe("string");
      expect(permissionsElementSchema.def.type).toBe("string");
    });
  });

  describe("type safety", () => {
    test("should maintain type information", () => {
      const schema = z.object({
        name: z.string().min(3).max(100),
        age: z.number().min(0).max(120),
        email: z.string().email(),
      });

      const nameSchema = resolve(schema, "name");
      const ageSchema = resolve(schema, "age");
      const emailSchema = resolve(schema, "email");

      // Check that schemas maintain their definitions
      expect(nameSchema._def).toEqual(schema.shape.name._def);
      expect(ageSchema._def).toEqual(schema.shape.age._def);
      expect(emailSchema._def).toEqual(schema.shape.email._def);
    });

    test("should preserve validation rules", () => {
      const schema = z.object({
        username: z.string().min(3).max(20),
        password: z.string().min(8),
      });

      const usernameSchema = resolve(schema, "username");
      const passwordSchema = resolve(schema, "password");

      // Test that validation rules are preserved
      expect(() => usernameSchema.parse("ab")).toThrow();
      expect(() => usernameSchema.parse("a".repeat(21))).toThrow();
      expect(usernameSchema.parse("abc")).toBe("abc");

      expect(() => passwordSchema.parse("short")).toThrow();
      expect(passwordSchema.parse("longpassword")).toBe("longpassword");
    });
  });
});
