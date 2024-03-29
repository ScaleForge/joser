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
    this.serializers = [...BUILT_IN_SERIALIZERS, ...(opts?.serializers ?? [])].reduce(
      (acc, item) => {
        return {
          ...acc,
          [item.name ?? item.type.name]: item,
        };
      },
      {}
    );
  }

  public deserialize(obj: Record<string, unknown>): Record<string, unknown> {
    const __t = obj['__t'] as { t: string[]; i: Record<string, unknown> };

    if (!__t) {
      return obj;
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

  public serialize(obj: Record<string, unknown>): Record<string, unknown> {
    const serializers = Object.values(this.serializers);

    const t: string[] = [];
    const i: [string[], number][] = [];
    const o: [string[], unknown][] = [];

    for (const [key, value] of toPairs(obj, [], serializers.map((item) => item.type))) {
      const type = typeof value;

      if (
        value === null ||
        value instanceof Array ||
        type === 'number' ||
        type === 'string' ||
        type === 'boolean'
      ) {
        o.push([key, value]);

        continue;
      }

      if (type === 'object') {
        const serializer = serializers.find((item) => value instanceof item.type);

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
