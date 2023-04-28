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

  deserialize<T>(raw: any): T {
    if (raw === undefined) {
      return undefined as never;
    }

    if (raw === null) {
      return null as never;
    }

    const _type = typeof raw;

    if (_type === 'number' || _type === 'string' || _type === 'boolean') {
      return raw;
    }

    if (_type !== 'object') {
      throw new Error(`unable to deserialize ${raw}`);
    }

    if (raw instanceof Array) {
      return raw.map((v) => this.deserialize(v), raw) as never;
    }

    if (raw instanceof Object) {
      const data: Record<string, unknown> = {};
      const __t: Record<string, unknown> = raw['__t'] || {};

      Object.keys(raw)
        .filter((key) => key !== '__t')
        .map((key) => {
          const type = Object.values(this.types).find(
            ({ type }) => type.name === __t[key]
          );

          if (type) {
            data[key] = type.deserialize(raw[key]);
          } else {
            data[key] = this.deserialize(raw[key]);
          }
        });

      return data as never;
    }

    throw new Error(`unable to deserialize ${raw}`);
  }
}
