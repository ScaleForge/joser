export function toPairs(
  obj: Record<string, unknown>,
  key?: string[],
  types?: unknown[]
): [string[], unknown][] {
  return Object.getOwnPropertyNames(obj).reduce((accum, k) => {
    const value = obj[k];

    if (value === undefined) {
      return accum;
    }

    const type = typeof value;

    if (
      value === null ||
      Array.isArray(value) ||
      type === 'number' ||
      type === 'string' ||
      type === 'boolean' ||
      (type === 'object' &&
        types &&
        types.find((t: never) => value instanceof t))
    ) {
      return [...accum, [[...(key ?? []), k], value]];
    }

    return [
      ...accum,
      ...toPairs(value as Record<string, unknown>, [...(key ?? []), k], types),
    ];
  }, []);
}
