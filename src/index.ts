import { fromPairs } from './libs/from-pairs';
import { get } from './libs/get';
import { set } from './libs/set';
import { toPairs } from './libs/to-pairs';

/* eslint-disable @typescript-eslint/ban-types */
export type Serializer<T = unknown, TSerialized = unknown> = {
  type: Function;
  name?: string;
  serialize: (value: T) => TSerialized;
  deserialize: (serialized: TSerialized) => T;
};

export type Options = {
  serializers?: Serializer[];
};

const BUILT_IN_SERIALIZERS: Serializer[] = [
  {
    type: Date,
    name: 'Date',
    serialize(value: Date) {
      return value.getTime();
    },
    deserialize(serialized: number) {
      return new Date(serialized);
    },
  },
  {
    type: Buffer,
    name: 'Buffer',
    serialize(value: Buffer) {
      return value.toString('base64');
    },
    deserialize(serialized: string) {
      return Buffer.from(serialized, 'base64');
    },
  },
  {
    type: Set,
    name: 'Set',
    serialize(value: Set<unknown>) {
      return [...value];
    },
    deserialize(serialized: unknown[]) {
      return new Set(serialized);
    },
  },
  {
    type: Map,
    name: 'Map',
    serialize(value: Map<string, unknown>) {
      return [...value.entries()];
    },
    deserialize(serialized: [string, unknown][]) {
      return new Map(serialized);
    },
  },
];

export class Joser {
  private serializers: Record<string, Serializer>;

  constructor(opts?: Options) {
    this.serializers = [
      ...BUILT_IN_SERIALIZERS,
      ...(opts?.serializers ?? []),
    ].reduce((acc, item) => {
      return {
        ...acc,
        [item.name ?? item.type.name]: item,
      };
    }, {});
  }

  public deserialize(obj: Record<string, unknown>): Record<string, unknown> {
    const __t = obj['__t'] as { t: string[]; i: Record<string, unknown> };

    if (!__t) {
      return obj;
    }

    delete obj['__t'];

    return toPairs(__t.i).reduce(
      (accum, [key, value]: [string[], number | [number, number][]]) => {
        if (Array.isArray(value)) {
          const deserializedArray = (get(key, obj) as unknown[]).map(
            (item, index) => {
              const typeIndices = value.find((item) => item.at(0) === index);

              if (typeIndices) {
                const type = __t.t[typeIndices.at(1)];
                const serializer = this.serializers[type];

                if (
                  Array.isArray(item) ||
                  (typeof item === 'object' && item !== null && !serializer)
                ) {
                  const { deserialize } = this.deserialize({
                    deserialize: item,
                    __t: {
                      t: __t.t,
                      i: { deserialize: typeIndices.at(1) },
                    },
                  });

                  return deserialize;
                }

                if (!serializer) {
                  throw new Error(`serializer does not exist: type=${type}`);
                }

                return serializer.deserialize(item);
              }

              return item;
            }
          );

          return set(key, deserializedArray, accum);
        }

        const type = __t?.t[value as number];
        const serializer = this.serializers[type];

        if (!serializer) {
          throw new Error(`serializer does not exist: type=${type}`);
        }

        return set(key, serializer.deserialize(get(key, obj)), accum);
      },
      obj
    );
  }

  public serialize(obj: Record<string, unknown>): Record<string, unknown> {
    const serializers = Object.values(this.serializers);

    const t: string[] = [];
    const i: [string[], number | [number, unknown][]][] = [];
    const o: [string[], unknown][] = [];

    for (const [key, value] of toPairs(
      obj,
      [],
      serializers.map((item) => item.type)
    )) {
      const type = typeof value;

      if (Array.isArray(value)) {
        const _i: [number, unknown][] = [];

        const serializedArray = value.map((item, index) => {
          const serializer = Object.values(this.serializers).find(
            (serializer) => item instanceof serializer.type
          );

          if (Array.isArray(item)) {
            const __i: [number, unknown][] = [];

            const { array, __t } = this.serialize({ array: item });

            for (const name of __t?.['t'] ?? []) {
              if (!t.includes(name)) {
                t.push(name);
              }
            }

            for (const i of __t?.['i']?.array ?? []) {
              const type = t.indexOf(__t['t'][i.at(1)]);
              __i.push([i.at(0), type]);
            }

            _i.push([index, __i]);
            return array;
          }

          if (typeof item === 'object' && item !== null && !serializer) {
            const serialized = this.serialize(item);

            for (const name of serialized?.['__t']?.['t'] ?? []) {
              if (!t.includes(name)) {
                t.push(name);
              }
            }

            if (serialized?.['__t']?.['i']) {
              _i.push([index, serialized['__t']['i']]);
            }

            if (serialized['__t']) {
              delete serialized['__t'];
            }

            return serialized;
          }

          if (!serializer) {
            return item;
          }

          const name = serializer.name ?? serializer.type.name;
          if (!t.includes(name)) {
            t.push(name);
          }

          _i.push([index, t.indexOf(name)]);
          return serializer.serialize(item);
        });

        o.push([key, serializedArray]);
        i.push([key, _i]);
        continue;
      }

      if (
        value === null ||
        type === 'number' ||
        type === 'string' ||
        type === 'boolean'
      ) {
        o.push([key, value]);

        continue;
      }

      if (type === 'object') {
        const serializer = serializers.find(
          (item) => value instanceof item.type
        );

        if (!serializer) {
          o.push([key, value]);

          continue;
        }

        const name = serializer.name ?? serializer.type.name;
        if (!t.includes(name)) {
          t.push(name);
        }

        i.push([key, t.indexOf(name)]);
        o.push([key, serializer.serialize(value)]);

        continue;
      }

      throw new Error(`cannot serialize: ${value}`);
    }

    if (t.length === 0) {
      return fromPairs(o);
    }

    return {
      ...fromPairs(o),
      __t: {
        t,
        i: fromPairs(i),
      },
    };
  }
}
