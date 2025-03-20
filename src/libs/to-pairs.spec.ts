import { toPairs } from './to-pairs';

describe('toPairs', () => {
  test.each([
    [{}, []],
    [{ a: {}, b: [] }, [[['a'], {}], [['b'], []]]],
    [{ a: 1 }, [[['a'], 1]]],
    [{ a: 1, b: 2 }, [[['a'], 1], [['b'], 2]]],
    [{ a: { b: 1 } }, [[['a', 'b'], 1]]],
    [[1, 2], [[[0], 1], [[1], 2]]],
    [{ a: [ 1, 2 ] }, [[['a', 0], 1], [['a', 1], 2]]],
    [{ a: [ { b: 1, c: [ 2, 3 ] } ] }, [[['a', 0, 'b'], 1], [['a', 0, 'c', 0], 2], [['a', 0, 'c', 1], 3]]],
    [{ a: 1, b: { c: 2, d: 3 }, e: 4 }, [[['a'], 1], [['b', 'c'], 2], [['b', 'd'], 3], [['e'], 4]]],
    [{ a: { b: { c: { d: { e: 1 } } } } }, [[['a', 'b', 'c', 'd', 'e'], 1]]],
    [{ Date: new Date('2023-10-07T06:35:16.142Z') }, [[['Date'], new Date('2023-10-07T06:35:16.142Z')]]],
    [{ a: { Date: new Date('2023-10-07T06:35:16.142Z'), Buffer: Buffer.from([1]) } }, [[['a', 'Date'], new Date('2023-10-07T06:35:16.142Z')], [['a', 'Buffer'], Buffer.from([1])]]],
  ])('given %p, should return %p', (obj, expected) => {
    expect(toPairs(obj, undefined, [Date, Buffer])).toEqual(expected);
  });
});
