import { describe, expect, test } from "bun:test";
import { z, ZodUnion } from "zod/v4";
import { flatten } from "../src/flatten";

describe("flatten", () => {
  describe("basic object schemas", () => {
    test("should flatten a simple object schema", () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const result = flatten(schema);

      expect(result).toEqual({
        name: schema.shape.name,
        age: schema.shape.age,
      });
    });

    test("should flatten nested object schemas", () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
          email: z.string(),
        }),
      });

      const result = flatten(schema);

      expect(result).toEqual({
        user: schema.shape.user,
        "user.name": schema.shape.user.shape.name,
        "user.email": schema.shape.user.shape.email,
      });
    });

    test("should flatten deeply nested object schemas", () => {
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

      const result = flatten(schema);

      expect(result).toEqual({
        company: schema.shape.company,
        "company.address": schema.shape.company.shape.address,
        "company.address.street":
          schema.shape.company.shape.address.shape.street,
        "company.address.city": schema.shape.company.shape.address.shape.city,
        "company.address.country":
          schema.shape.company.shape.address.shape.country,
        "company.address.country.name":
          schema.shape.company.shape.address.shape.country.shape.name,
        "company.address.country.code":
          schema.shape.company.shape.address.shape.country.shape.code,
      });
    });
  });

  describe("array schemas", () => {
    test("should flatten a simple array schema", () => {
      const schema = z.array(z.string());

      const result = flatten(schema);

      expect(result).toEqual({
        "[]": schema.element,
      });
    });

    test("should flatten array of objects", () => {
      const schema = z.array(
        z.object({
          id: z.string(),
          name: z.string(),
        })
      );

      const result = flatten(schema);

      expect(result).toEqual({
        "[]": schema.element,
        "[].id": schema.element.shape.id,
        "[].name": schema.element.shape.name,
      });
    });

    test("should flatten nested arrays", () => {
      const schema = z.array(z.array(z.number()));

      const result = flatten(schema);

      expect(result).toEqual({
        "[]": schema.element,
        "[][]": schema.element.element,
      });
    });

    test("should flatten object with array property", () => {
      const schema = z.object({
        items: z.array(z.string()),
      });

      const result = flatten(schema);

      expect(result).toEqual({
        items: schema.shape.items,
        "items[]": schema.shape.items.element,
      });
    });

    test("should flatten object with nested array of objects", () => {
      const schema = z.object({
        users: z.array(
          z.object({
            name: z.string(),
            tags: z.array(z.string()),
          })
        ),
      });

      const result = flatten(schema);

      expect(result).toEqual({
        users: schema.shape.users,
        "users[]": schema.shape.users.element,
        "users[].name": schema.shape.users.element.shape.name,
        "users[].tags": schema.shape.users.element.shape.tags,
        "users[].tags[]": schema.shape.users.element.shape.tags.element,
      });
    });
  });

  describe("tuple schemas", () => {
    test("should flatten a simple tuple schema", () => {
      const schema = z.tuple([z.string(), z.number()]);

      const result = flatten(schema);

      expect(result).toEqual({
        "[0]": schema.def.items[0],
        "[1]": schema.def.items[1],
      });
    });

    test("should flatten tuple with object elements", () => {
      const schema = z.tuple([
        z.object({ name: z.string() }),
        z.object({ age: z.number() }),
      ]);

      const result = flatten(schema);

      expect(result).toEqual({
        "[0]": schema.def.items[0],
        "[0].name": schema.def.items[0].shape.name,

        "[1]": schema.def.items[1],
        "[1].age": schema.def.items[1].shape.age,
      });
    });

    test("should flatten tuple with nested arrays", () => {
      const schema = z.tuple([z.array(z.string()), z.array(z.number())]);

      const result = flatten(schema);

      expect(result).toEqual({
        "[0]": schema.def.items[0],
        "[0][]": schema.def.items[0].element,

        "[1]": schema.def.items[1],
        "[1][]": schema.def.items[1].element,
      });
    });

    test("should flatten object with tuple property", () => {
      const schema = z.object({
        coordinates: z.tuple([z.number(), z.number()]),
      });

      const result = flatten(schema);

      expect(result).toEqual({
        coordinates: schema.def.shape.coordinates,
        "coordinates[0]": schema.def.shape.coordinates.def.items[0],
        "coordinates[1]": schema.def.shape.coordinates.def.items[1],
      });
    });
  });

  describe("union schemas", () => {
    test("should flatten union of primitives", () => {
      const schema = z.union([z.string(), z.number()]);

      const result = flatten(schema);

      // Union of primitives doesn't add any flattened keys

      expect(result).toEqual({});
    });

    test("should flatten union of objects with common fields", () => {
      const schema = z.union([
        z.object({ type: z.literal("a"), value: z.string() }),
        z.object({ type: z.literal("b"), value: z.number() }),
      ]);

      const result = flatten(schema);

      expect(result).toEqual({ type: result.type, value: result.value });

      expect(result.type).toBeInstanceOf(ZodUnion);
      expect(result.value).toBeInstanceOf(ZodUnion);
    });

    test("should flatten union of objects with different fields", () => {
      const schemas = [
        z.object({ name: z.string(), age: z.number() }),
        z.object({ title: z.string(), count: z.number() }),
      ] as const;
      const schema = z.union(schemas);

      const result = flatten(schema);

      expect(result).toEqual({
        name: schemas[0].shape.name,
        age: schemas[0].shape.age,
        title: schemas[1].shape.title,
        count: schemas[1].shape.count,
      });
    });

    test("should flatten union with nested objects", () => {
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

      const result = flatten(schema);

      expect(Object.keys(result)).toEqual([
        "type",
        "data",
        "data.name",
        "data.companyName",
      ]);
    });

    test("should flatten union with arrays", () => {
      const schema = z.union([
        z.object({ items: z.array(z.string()) }),
        z.object({ items: z.array(z.number()) }),
      ]);

      const result = flatten(schema);

      expect(Object.keys(result)).toEqual(["items", "items[]"]);
    });
  });

  describe("optional and nullable schemas", () => {
    test("should not unwrap optional trailing schemas", () => {
      const schema = z.object({
        name: z.string().optional(),
        age: z.number().optional(),
      });

      const result = flatten(schema);

      expect(result).toEqual({
        name: schema.shape.name,
        age: schema.shape.age,
      });
    });

    test("should not unwrap nullable trailing schemas", () => {
      const schema = z.object({
        email: z.string().nullable(),
        phone: z.string().nullable(),
      });

      const result = flatten(schema);

      expect(result).toEqual({
        email: schema.shape.email,
        phone: schema.shape.phone,
      });
    });

    test("should unwrap nested optional objects", () => {
      const schema = z.object({
        user: z
          .object({
            name: z.string(),
            email: z.string(),
          })
          .optional(),
      });

      const result = flatten(schema);

      expect(result).toEqual({
        user: schema.shape.user,
        "user.name": schema.shape.user.unwrap().shape.name,
        "user.email": schema.shape.user.unwrap().shape.email,
      });
    });

    test("should unwrap nullable arrays", () => {
      const schema = z.object({
        tags: z.array(z.string()).nullable(),
      });

      const result = flatten(schema);

      expect(result).toEqual({
        tags: schema.shape.tags,
        "tags[]": schema.shape.tags.unwrap().element,
      });
    });

    test("should unwrap both optional and nullable", () => {
      const schema = z.object({
        data: z
          .object({
            value: z.string(),
          })
          .optional()
          .nullable(),
      });

      const result = flatten(schema);

      expect(result).toEqual({
        data: schema.shape.data,
        "data.value": schema.shape.data.unwrap().unwrap().shape.value,
      });
    });
  });

  describe("default schemas", () => {
    test("should not unwrap default trailing schemas", () => {
      const schema = z.object({
        name: z.string().default("John"),
        age: z.number().default(0),
      });

      const result = flatten(schema);

      expect(result).toEqual({
        name: schema.shape.name,
        age: schema.shape.age,
      });
    });

    test("should unwrap nested default objects", () => {
      const schema = z.object({
        user: z
          .object({
            name: z.string(),
            email: z.string(),
          })
          .default({ name: "John", email: "john@example.com" }),
      });

      const result = flatten(schema);

      expect(result).toEqual({
        user: schema.shape.user,
        "user.name": schema.shape.user.unwrap().shape.name,
        "user.email": schema.shape.user.unwrap().shape.email,
      });
    });

    test("should unwrap default arrays", () => {
      const schema = z.object({
        tags: z.array(z.string()).default([]),
      });

      const result = flatten(schema);

      expect(result).toEqual({
        tags: schema.shape.tags,
        "tags[]": schema.shape.tags.unwrap().element,
      });
    });

    test("should unwrap default combined with optional", () => {
      const schema = z.object({
        data: z
          .object({
            value: z.string(),
            count: z.number(),
          })
          .default({ value: "default", count: 0 })
          .optional(),
      });

      const result = flatten(schema);

      expect(result).toEqual({
        data: schema.shape.data,
        "data.value": schema.shape.data.unwrap().unwrap().shape.value,
        "data.count": schema.shape.data.unwrap().unwrap().shape.count,
      });
    });

    test("should unwrap default combined with nullable", () => {
      const schema = z.object({
        config: z
          .object({
            enabled: z.boolean(),
            timeout: z.number(),
          })
          .default({ enabled: true, timeout: 5000 })
          .nullable(),
      });

      const result = flatten(schema);

      expect(result).toEqual({
        config: schema.shape.config,
        "config.enabled": schema.shape.config.unwrap().unwrap().shape.enabled,
        "config.timeout": schema.shape.config.unwrap().unwrap().shape.timeout,
      });
    });

    test("should unwrap default, optional, and nullable", () => {
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

      const result = flatten(schema);

      expect(result).toEqual({
        settings: schema.shape.settings,
        "settings.theme": schema.shape.settings.unwrap().unwrap().unwrap().shape
          .theme,
        "settings.fontSize": schema.shape.settings.unwrap().unwrap().unwrap()
          .shape.fontSize,
      });
    });

    test("should unwrap array of objects with default values", () => {
      const schema = z.object({
        items: z
          .array(
            z.object({
              id: z.string(),
              name: z.string().default("Unnamed"),
            })
          )
          .default([]),
      });

      const result = flatten(schema);

      expect(result).toEqual({
        items: schema.shape.items,
        "items[]": schema.shape.items.unwrap().element,
        "items[].id": schema.shape.items.unwrap().element.shape.id,
        "items[].name": schema.shape.items.unwrap().element.shape.name,
      });
    });

    test("should unwrap deeply nested structures with default values", () => {
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

      const result = flatten(schema);

      expect(result).toEqual({
        config: schema.shape.config,
        "config.database": schema.shape.config.unwrap().shape.database,
        "config.database.host": schema.shape.config
          .unwrap()
          .shape.database.unwrap().shape.host,
        "config.database.port": schema.shape.config
          .unwrap()
          .shape.database.unwrap().shape.port,
        "config.database.credentials": schema.shape.config
          .unwrap()
          .shape.database.unwrap().shape.credentials,
        "config.database.credentials.username": schema.shape.config
          .unwrap()
          .shape.database.unwrap()
          .shape.credentials.unwrap().shape.username,
        "config.database.credentials.password": schema.shape.config
          .unwrap()
          .shape.database.unwrap()
          .shape.credentials.unwrap().shape.password,
      });
    });

    test("should unwrap mixed default, optional and nullable in complex nested structure", () => {
      const schema = z.object({
        profile: z
          .object({
            bio: z.string().default("No bio"),
            avatar: z.string().nullable().default("default.png"),
            social: z
              .object({
                twitter: z.string().optional(),
                github: z.string(),
              })
              .default({ twitter: "", github: "" })
              .nullable(),
          })
          .optional(),
      });

      const result = flatten(schema);

      expect(result).toEqual({
        profile: schema.shape.profile,
        "profile.bio": schema.shape.profile.unwrap().shape.bio,
        "profile.avatar": schema.shape.profile.unwrap().shape.avatar,
        "profile.social": schema.shape.profile.unwrap().shape.social,
        "profile.social.twitter": schema.shape.profile
          .unwrap()
          .shape.social.unwrap()
          .unwrap().shape.twitter,
        "profile.social.github": schema.shape.profile
          .unwrap()
          .shape.social.unwrap()
          .unwrap().shape.github,
      });
    });
  });

  describe("complex nested schemas", () => {
    test("should flatten complex schema with all types", () => {
      const schema = z.object({
        id: z.string(),
        metadata: z.object({
          created: z.string(),
          updated: z.string(),
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

      const result = flatten(schema);
      expect(result).toEqual({
        id: schema.shape.id,
        items: schema.shape.items,
        status: schema.shape.status,

        metadata: schema.shape.metadata,
        "metadata.created": schema.shape.metadata.shape.created,
        "metadata.updated": schema.shape.metadata.shape.updated,

        coordinates: schema.shape.coordinates,
        "coordinates[0]": schema.shape.coordinates.def.items[0],
        "coordinates[1]": schema.shape.coordinates.def.items[1],

        "items[]": schema.shape.items.element,
        "items[].name": schema.shape.items.element.shape.name,
        "items[].tags": schema.shape.items.element.shape.tags,
        "items[].tags[]": schema.shape.items.element.shape.tags.element,
      });
    });

    test("should flatten schema with optional nested structures", () => {
      const schema = z.object({
        user: z
          .object({
            profile: z
              .object({
                bio: z.string(),
                avatar: z.string().optional(),
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

      const result = flatten(schema);

      expect(result).toEqual({
        user: schema.shape.user,

        "user.profile": schema.shape.user.unwrap().shape.profile,
        "user.profile.bio": schema.shape.user.unwrap().shape.profile.unwrap()
          .shape.bio,
        "user.profile.avatar": schema.shape.user.unwrap().shape.profile.unwrap()
          .shape.avatar,

        "user.contacts": schema.shape.user.unwrap().shape.contacts,
        "user.contacts[]": schema.shape.user
          .unwrap()
          .shape.contacts.unwrap()
          .unwrap(),
        "user.contacts[].type": schema.shape.user
          .unwrap()
          .shape.contacts.unwrap()
          .unwrap().shape.type,
        "user.contacts[].value": schema.shape.user
          .unwrap()
          .shape.contacts.unwrap()
          .unwrap().shape.value,
      });
    });

    test("should flatten union of complex schemas", () => {
      const schemas = {
        car: z.object({
          type: z.literal("car"),
          wheels: z.number(),
          engine: z.object({
            type: z.string(),
            horsepower: z.number(),
          }),
        }),
        bike: z.object({
          type: z.literal("bike"),
          wheels: z.number(),
          pedals: z.boolean(),
        }),
      };
      const schema = z.union([schemas.car, schemas.bike]);

      const result = flatten(schema);

      expect(result).toEqual({
        type: result.type,
        wheels: result.wheels,

        engine: schemas.car.shape.engine,
        "engine.type": schemas.car.shape.engine.shape.type,
        "engine.horsepower": schemas.car.shape.engine.shape.horsepower,

        pedals: schemas.bike.shape.pedals,
      });

      expect(result.type).toBeInstanceOf(ZodUnion);
      expect(result.type.options).toEqual([
        schemas.car.shape.type,
        schemas.bike.shape.type,
      ]);

      expect(result.wheels).toBeInstanceOf(ZodUnion);
      expect(result.wheels.options).toEqual([
        schemas.car.shape.wheels,
        schemas.bike.shape.wheels,
      ]);
    });
  });

  describe("edge cases", () => {
    test("should handle empty object", () => {
      const schema = z.object({});

      const result = flatten(schema);

      expect(result).toEqual({});
    });

    test("should handle single field object", () => {
      const schema = z.object({
        name: z.string(),
      });

      const result = flatten(schema);

      expect(result).toEqual({
        name: schema.shape.name,
      });
    });

    test("should handle array of primitives", () => {
      const schema = z.array(z.string());

      const result = flatten(schema);

      expect(result).toEqual({
        "[]": schema.element,
      });
    });

    test("should handle empty tuple", () => {
      const schema = z.tuple([]);

      const result = flatten(schema);

      expect(result).toEqual({});
    });

    test("should handle deeply nested arrays", () => {
      const schema = z.array(z.array(z.array(z.string())));

      const result = flatten(schema);

      expect(result).toEqual({
        "[]": schema.element,
        "[][]": schema.element.element,
        "[][][]": schema.element.element.element,
      });
    });
  });
});
