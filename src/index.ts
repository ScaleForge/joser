import R from 'ramda';

export type SerializerType<TValue = any, TRaw = any> = {
  type: Function;
  serialize: (value: TValue) => TRaw;
  deserialize: (raw: TRaw) => TValue;
};

const BUILT_IN_TYPES: SerializerType[] = [
  {
    type: Date,
    serialize(value: Date) {
      return value.getTime();
    },
    deserialize(raw: number) {
      return new Date(raw);
    },
  },
  {
    type: Buffer,
    serialize(value: Buffer) {
      return value.toString('hex');
    },
    deserialize(raw: string) {
      return Buffer.from(raw, 'hex');
    },
  },
];

export class Serializer {
  private types: Record<string, SerializerType>;
  constructor(opts?: { types?: SerializerType[] }) {
    this.types = [...BUILT_IN_TYPES, ...(opts?.types || [])].reduce(
      (acc, item) => {
        return {
          ...acc,
          [item.type.name]: item,
        };
      },
      {}
    );
  }

  private getType(value: any) {
    return R.find(
      ({ type }) => value instanceof type,
      [...BUILT_IN_TYPES, ...R.values(this.types)]
    );
  }
  serialize(value: any): any {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return null;
    }

    const _type = typeof value;

    if (_type === 'number' || _type === 'string' || _type === 'boolean') {
      return value;
    }

    if (value instanceof Array) {
      return R.map((v) => this.serialize(v), value);
    }

    const type = this.getType(value);

    if (!type) {
      const data: Record<string, unknown> = {};
      const __t: Record<string, unknown> = {};
      for (const [key, val] of R.toPairs(value)) {
        data[key] = this.serialize(val);

        const type = this.getType(val);

        if (type) {
          __t[key] = type.type.name;
        }
      }

      return {
        ...data,
        __t: {
          ...__t,
        },
      };
    }

    return type.serialize(value as never);
  }

  deserialize<T>(raw: any): T {
    throw new Error('not implemented');
  }
}
