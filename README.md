# `joser` (Javascript Object Serializer)

```typescript
const joser = new Joser();

const obj = {
  number: 1,
  string: 'string',
  boolean: true,
  null: null,
  Date: new Date('2023-04-25T00:00:00Z'),
  Buffer: Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
};

const serialized = joser.serialize(obj);

assert.deepEqual(serialized, {
  number: 1,
  string: 'string',
  boolean: true,
  null: null,
  Date: 1682380800000,
  Buffer: '00010203040506070809',
  __t: {
    Date: 'Date',
    Buffer: 'Buffer',
  },
});

assert.deepEqual(joser.deserialize(serialized), obj);
```

## Built-in serializers
Joser has built-in serializers for the following NodeJS classes:
- `Date`
- `Buffer`
- `Set`
- `Map`

## Custom serializers
It is also possible to provide custom serializers for custom classes. For example, to serialize the custom class `ObjectId`:
```typescript
const joser = new Joser({
  serializers: [
    {
      type: ObjectId,
      serialize: (value: ObjectId) => value.toString(),
      deserialize: (raw: string) => ObjectId.from(raw),
    },
  ]
});
```