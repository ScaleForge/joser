
import { get } from './libs/get';
import { set as _set } from './libs/set-legacy';
import { toPairs as _toPairs } from './libs/to-pairs-legacy';
import { toPairs } from './libs/to-pairs';
import { Key } from './libs/types';
import { fromPairs } from './libs/from-pairs';
import { set } from './libs/set';

export type Serializer<TDeserialized, TSerialized> = {
  /* eslint-disable @typescript-eslint/ban-types */
  type: Function;
  name?: string;
  serialize: (value: TDeserialized) => TSerialized;
  deserialize: (serialized: TSerialized) => TDeserialized;
};

export type Options<TSerializer> = {
  serializers?: TSerializer[];
};

const BUILT_IN_SERIALIZERS = [
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

/* eslint-disable @typescript-eslint/no-explicit-any */
export class Joser<TSerializer extends Serializer<any, any> = Serializer<any, any>> {
  private serializers: Record<string, TSerializer>;

  constructor(opts?: Options<TSerializer>) {
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

  public deserialize(obj: Record<string, unknown>) {
    const __t = obj['__t'] as { t: string[]; i: Record<string, unknown>, v?: 1 };

    if (!__t) {
      return obj;
    }

    if (__t.v !== 1) {
      return this._deserialize(obj);
    }

    delete obj['__t'];

    return toPairs(__t.i).reduce((accum, [key, value]: [string[], number]) => {
      const type = __t.t[value];

      const serializer = this.serializers[type];
      
      if (!serializer) {
        throw new Error(`serializer does not exist: type=${type}`);
      }

      return set(key, serializer.deserialize(get(key, obj)), accum);
    }, obj);
  }

  public _deserialize(obj: Record<string, unknown>): Record<string, unknown> {
    const __t = obj['__t'] as { t: string[]; i: Record<string, unknown> };

    if (!__t) {
      return obj;
    }

    delete obj['__t'];

    return _toPairs(__t.i).reduce(
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
                  const { deserialize } = this._deserialize({
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

          return _set(key, deserializedArray, accum);
        }

        const type = __t?.t[value as number];
        const serializer = this.serializers[type];

        if (!serializer) {
          throw new Error(`serializer does not exist: type=${type}`);
        }

        return _set(key, serializer.deserialize(get(key, obj)), accum);
      },
      obj
    );
  }

  public serialize(obj: Record<string, unknown>): Record<string, unknown> {
    const serializers = Object.values(this.serializers);

    const t: string[] = [];
    const i: [Key[], number | [number, unknown][]][] = [];
    const o: [Key[], unknown][] = [];

    for (const [key, value] of toPairs(
      obj,
      [],
      serializers.map((item) => item.type)
    )) {
      const type = typeof value;

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
      return <never>fromPairs(o);
    }

    return {
      ...fromPairs(o),
      __t: {
        t,
        i: fromPairs(i),
        v: 1,
      },
    };
  }
}
