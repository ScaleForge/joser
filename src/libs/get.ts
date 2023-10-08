/* eslint-disable @typescript-eslint/no-explicit-any */
export function get(key: string[], obj: Record<string, unknown>) {
  let value: any = obj;

  for (const k of key) {
    value = value[k];

    if (value === undefined) {
      return undefined;
    }
  }

  return value;
}