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

    if (_type !== 'object') {
      throw new Error(`unable to serialize ${value}`);
    }

    if (value instanceof Array) {
      return value.map((v) => this.serialize(v), value);
    }

    if (value.constructor === Object) {
      const data: Record<string, unknown> = {};
      const __t: Record<string, unknown> = {};

      Object.keys(value).map((key) => {
        const type = Object.values(this.types).find(
          ({ type }) => value[key] instanceof type
        );

        if (type) {
          data[key] = type.serialize(value[key]);
          __t[key] = type.type.name;
        } else {
          data[key] = this.serialize(value[key]);
        }
      });

      return Object.assign(
        data,
        Object.keys(__t).length > 0
          ? {
              __t,
            }
          : {}
      );
    }

    throw new Error(`unable to serialize ${value}`);
  }
}
