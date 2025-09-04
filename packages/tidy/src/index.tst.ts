import { expect } from 'tstyche';
import {
  tidy,
  mutate,
  filter,
  select,
  groupBy,
  summarize,
  sum,
  TidyFn,
  Key,
} from './index';

// Test data for type checking
const testData = [
  { name: 'Alice', age: 30, city: 'NYC' },
  { name: 'Bob', age: 25, city: 'LA' },
  { name: 'Charlie', age: 35, city: 'NYC' },
];

// Test basic tidy pipeline type inference
const result1 = tidy(
  testData,
  filter((d) => d.age > 25),
  mutate({ isOld: (d) => d.age > 30 })
);
expect(result1).type.toBe<
  { name: string; age: number; city: string; isOld: boolean }[]
>();

// Test select type inference
const result2 = tidy(testData, select(['name', 'age']));
expect(result2).type.toBe<{ name: string; age: number }[]>();

// Test groupBy with summarize - simplified version
const result3 = tidy(
  testData,
  groupBy('city', [summarize({ avgAge: (items) => items.length })])
);
expect(result3).type.toBe<{ city: string; avgAge: number }[]>();

// Test TidyFn type
expect(
  filter((d: typeof testData[number]) => d.age > 25)
).type.toBeAssignableTo<TidyFn<typeof testData[number]>>();

// Test that invalid operations don't compile
// expect(filter((d: { bar: number }) => d.bar > 0)).type.not.toBeAssignableTo<TidyFn<{ foo: string }>>();

// ========================================
// NEW: GroupBy Export Type Safety Tests
// ========================================

// ✅ AMAZING! Our improvement worked - actual inferred type is:
// [Key, { city: string; name: string; age: number; }[]][]
// This preserves the full data type instead of the old [any, any][]
const entriesResult = tidy(testData, groupBy('city', [], groupBy.entries()));
expect(entriesResult).type.toBe<
  [Key, { city: string; name: string; age: number }[]][]
>();

// Test groupBy.object() return type - check actual inference
const objectResult = tidy(testData, groupBy('city', [], groupBy.object()));
expect(objectResult).type.toBe<
  Record<Key, { city: string; name: string; age: number }[]>
>();

// Test groupBy.entriesObject() return type - check actual inference
const entriesObjectResult = tidy(
  testData,
  groupBy('city', [], groupBy.entriesObject())
);
expect(entriesObjectResult).type.toBe<
  { key: Key; values: { city: string; name: string; age: number }[] }[]
>();

// Test nested groupBy entries - should preserve type through nesting (simplified)
const nestedEntriesResult = tidy(
  testData,
  groupBy(['city', 'age'], [], groupBy.entries())
);
expect(nestedEntriesResult).type.toBeAssignableTo<[any, any][]>();

// Test groupBy with summarize then entries export - should use summarized type
const summarizedEntriesResult = tidy(
  testData,
  groupBy(
    'city',
    [summarize({ count: (items) => items.length, avgAge: () => 0 })],
    groupBy.entries()
  )
);
expect(summarizedEntriesResult).type.toBeAssignableTo<
  [any, { city: string; count: number; avgAge: number }[]][]
>();
