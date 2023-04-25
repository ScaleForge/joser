export type SerializerType<TValue = any, TRaw = any> = {
  type: Function;
  serialize: (value: TValue) => TRaw;
  deserialize: (raw: TRaw) => TValue;
}

const BUILT_IN_TYPES: SerializerType[] = [
  {
    type: Date,
    serialize(value: Date) {
      return value.getTime();
    },
    deserialize(raw: number) {
      return new Date(raw);
    }
  },
  {
    type: Buffer,
    serialize(value: Buffer) {
      return value.toString('hex');
    },
    deserialize(raw: string) {
      return Buffer.from(raw, 'hex');
    }
  }
]

export class Serializer {
  private types: Record<string, SerializerType>;
  constructor(opts?: {
    types?: SerializerType[]
  }) {
    this.types = [...BUILT_IN_TYPES, ...(opts?.types || [])].reduce((acc, item) => {
      acc[item.type.name] = item;
      return acc;
    }, {});
  }

  serialize(value: any): any {
    throw new Error('not implemented');
  }

  deserialize<T>(raw: any): T {
    throw new Error('not implemented');
  }
}
