import { Key } from './types';

export function set(key: Key[], value: unknown, obj?: Record<string, unknown> | Array<unknown>) {
  const [first, ...rest] = key;
  
  if (typeof first === 'number') {
    const _obj = obj ?? [];

    const [first, ...rest] = key;

    if (rest.length === 0) {
      _obj[first] = value;

      return _obj;
    }

    _obj[first] = set(rest, value, _obj[first] ?? (typeof rest[0] === 'number' ? [] : {}));

    return _obj;
  }

  const _obj = obj ?? {};

  if (rest.length === 0) {
    return {
      ..._obj,
      [first]: value,
    };
  }

  return {
    ...obj,
    [first]: set(rest, value, _obj[first]),
  };
}