import { set } from './set';

export function fromPairs(pairs: [string[], unknown][]): Record<string, unknown> {
  return pairs.reduce((accum, [key, value]) => set(key, value, accum), {});
}
