import { Key } from './types';


function isPrimitiveOrInstance(
  value: unknown,
  types?: unknown[]
): boolean {
  const type = typeof value;
  return (
    value === null ||
    type === 'number' ||
    type === 'string' ||
    type === 'boolean' ||
    (type === 'object' &&
      types?.some((t: never) => value instanceof t))
  );
}

export function toPairs(
  obj: Record<string, unknown> | Array<unknown>,
  key: Key[] = [],
  types: unknown[] = [],
): [Key[], unknown][] {
  if (Array.isArray(obj)) {
    return obj.reduce<[Key[], unknown][]>((accum, value, index) => {
      if (value === undefined) {
        return accum;
      }

      const _key = [...key, index];

      if (isPrimitiveOrInstance(value, types)) {
        accum.push([_key, value]);
      } else if (typeof value === 'object') {
        accum.push(...toPairs(value as Record<string, unknown>, _key, types));
      }

      return accum;
    }, []);
  }

  return Object.getOwnPropertyNames(obj).reduce<[Key[], unknown][]>((accum, prop) => {
    const value = obj[prop];

    if (value === undefined) {
      return accum;
    }

    const _key = [...key, prop];

    if (isPrimitiveOrInstance(value, types)) {
      accum.push([_key, value]);
    } else if (typeof value === 'object') {
      accum.push(...toPairs(value as Record<string, unknown>, _key, types));
    }

    return accum;
  }, []);
}
