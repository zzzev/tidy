import { expectType, expectAssignable, expectNotAssignable } from 'tsd';
import {
  tidy,
  mutate,
  filter,
  select,
  groupBy,
  summarize,
  sum,
  TidyFn,
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
expectType<{ name: string; age: number; city: string; isOld: boolean }[]>(
  result1
);

// Test select type inference
const result2 = tidy(testData, select(['name', 'age']));
expectType<{ name: string; age: number }[]>(result2);

// Test groupBy with summarize - simplified version
const result3 = tidy(
  testData,
  groupBy('city', [summarize({ avgAge: (items) => items.length })])
);
expectType<{ city: string; avgAge: number }[]>(result3);

// Test TidyFn type
expectAssignable<TidyFn<typeof testData[number]>>(filter((d) => d.age > 25));
expectAssignable<TidyFn<typeof testData[number]>>(mutate({ isOld: true }));

// Test that invalid operations don't compile
// expectNotAssignable<TidyFn<{ foo: string }>>(filter((d: { bar: number }) => d.bar > 0));
