import { UnionToIntersection } from "utility-types";
import { core, ZodUnion } from "zod/v4";

type MergeUnion<
  U extends Record<string, core.$ZodType>[],
  Acc extends Record<string, core.$ZodType> = {},
> = U extends [
  infer First extends Record<string, core.$ZodType>,
  ...infer Rest extends Record<string, core.$ZodType>[],
]
  ? MergeUnion<
      Rest,
      { [Key in Exclude<keyof Acc, keyof First>]: Acc[Key] } & {
        [K in keyof First]: K extends keyof Acc
          ? Acc[K] extends ZodUnion<
              infer Union extends readonly core.$ZodType[]
            >
            ? ZodUnion<readonly [First[K], ...Union]>
            : ZodUnion<readonly [First[K], Acc[K]]>
          : First[K];
      }
    >
  : Acc;

type UnwrapSchema<T extends core.$ZodType> =
  T extends core.$ZodOptional<infer Inner extends core.$ZodType>
    ? UnwrapSchema<Inner>
    : T extends core.$ZodNullable<infer Inner extends core.$ZodType>
      ? UnwrapSchema<Inner>
      : T extends core.$ZodDefault<infer Inner extends core.$ZodType>
        ? UnwrapSchema<Inner>
        : T;

type RemoveTrailingDot<Content extends string> =
  Content extends `${infer Prefix}.` ? RemoveTrailingDot<Prefix> : Content;

type FlattenArraySchema<T extends core.$ZodType, Prefix extends string = ""> =
  T extends core.$ZodArray<infer Item extends core.$ZodType>
    ? [
        { [K in `${RemoveTrailingDot<Prefix>}[]`]: Item },
        FlattenSchema<Item, `${RemoveTrailingDot<Prefix>}[].`>,
      ]
    : [];

type FlattenUnionSchema<T extends core.$ZodType, Prefix extends string = ""> =
  T extends core.$ZodUnion<
    readonly [
      infer First extends core.$ZodType,
      ...infer Rest extends readonly core.$ZodType[],
    ]
  >
    ? Rest extends readonly [
        infer Next extends core.$ZodType,
        ...infer Remaining extends readonly core.$ZodType[],
      ]
      ? [
          ...FlattenUnionSchema<
            core.$ZodUnion<readonly [Next, ...Remaining]>,
            Prefix
          >,
          FlattenSchema<First, Prefix>,
        ]
      : [FlattenSchema<First, Prefix>]
    : [];

type FlattenTupleSchema<T extends core.$ZodType, Prefix extends string = ""> =
  T extends core.$ZodTuple<
    [
      ...infer Rest extends readonly core.$ZodType[],
      infer Last extends core.$ZodType,
    ]
  >
    ? Rest extends readonly [core.$ZodType, ...core.$ZodType[]]
      ? [
          FlattenSchema<Last, `${Prefix}[${Rest["length"]}]`>,
          ...FlattenTupleSchema<core.$ZodTuple<Rest>, Prefix>,
          {
            [K in `${RemoveTrailingDot<Prefix>}[${Rest["length"]}]`]: Last;
          },
        ]
      : [
          FlattenSchema<Last, `${Prefix}[${Rest["length"]}]`>,
          { [K in `${RemoveTrailingDot<Prefix>}[${Rest["length"]}]`]: Last },
        ]
    : [];

type ToPrefix<
  T extends string | number,
  Prefix extends string,
> = Prefix extends ""
  ? `${T}`
  : Prefix extends `${string}.`
    ? `${Prefix}${T}`
    : `${Prefix}.${T}`;

type FlattenObjectSchema<T extends core.$ZodType, Prefix extends string = ""> =
  T extends core.$ZodObject<infer Shape>
    ? [
        {
          [K in Exclude<keyof Shape, symbol> as ToPrefix<K, Prefix>]: Shape[K];
        },
        UnionToIntersection<
          {
            [K in Exclude<keyof Shape, symbol>]: Shape[K] extends core.$ZodType
              ? FlattenSchema<Shape[K], ToPrefix<K, Prefix>>
              : {};
          }[Exclude<keyof Shape, symbol>]
        >,
      ]
    : [];

export type FlattenSchema<
  T extends core.$ZodType,
  Prefix extends string = "",
> = MergeUnion<
  [
    ...FlattenTupleSchema<UnwrapSchema<T>, Prefix>,
    ...FlattenUnionSchema<UnwrapSchema<T>, Prefix>,
    ...FlattenArraySchema<UnwrapSchema<T>, Prefix>,
    ...FlattenObjectSchema<UnwrapSchema<T>, Prefix>,
  ]
>;
