import { fromPairs } from './from-pairs';

describe('fromPairs', () => {
  test.each([
    [[], {}],
    [[[['a'], 1]], { a: 1 }],
    [[[['a', 'b', 'c'], 1]], { a: { b: { c: 1 } } }],
    [[[['a', 'b'], 1], [['a', 'c'], 1], [['d'], 1]], { a: { b: 1, c: 1 }, d: 1 }],
    [[[['a', 'b', 'c'], 1], [['a', 'b', 'd'], 1]], { a: { b: { c: 1, d: 1 } } }],
    [[[[0], 1], [[1], 2]], [1, 2]],
  ])('given %p, should return %p', (pairs, expected) => {
    expect(fromPairs(pairs as never)).toEqual(expected);
  });
});
