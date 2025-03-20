import { set } from './set';
import { Key } from './types';

export function fromPairs(pairs: [Key[], unknown][]): Record<string, unknown> | Array<unknown> {
  return pairs.reduce((accum, [key, value]) => set(key, value, accum), undefined) ?? {};
}
