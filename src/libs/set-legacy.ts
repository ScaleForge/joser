export function set(key: string[], value: unknown, obj: Record<string, unknown> = {}) {
  const [first, ...rest] = key;

  if (rest.length === 0) {
    return {
      ...obj,
      [first]: value,
    };
  }

  return {
    ...obj,
    [first]: {
      ...((obj)[first] ?? {}) as Record<string, unknown>,
      ...set(rest, value, obj[first] as Record<string, unknown>),
    },
  };
}