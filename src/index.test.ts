import { randomBytes } from 'crypto';
import { Joser } from './index';

describe('Joser', () => {
  const cases = [
    [
      {
        number: 1,
        string: 'string',
        boolean: true,
        null: null,
      },
      {
        number: 1,
        string: 'string',
        boolean: true,
        null: null,
      },
    ],
    [
      {
        Date: new Date('2023-04-25T00:00:00Z'),
      },
      {
        Date: 1682380800000,
        __t: {
          t: ['Date'],
          i: {
            Date: 0,
          },
        },
      },
    ],
    [
      {
        Date: new Date('2023-04-25T00:00:00Z'),
        inner: {
          Date: new Date('2023-04-25T00:00:00Z'),
        },
      },
      {
        Date: 1682380800000,
        inner: {
          Date: 1682380800000,
        },
        __t: {
          t: ['Date'],
          i: {
            Date: 0,
            inner: {
              Date: 0,
            },
          },
        },
      },
    ],
    [
      {
        Array: [
          Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
          new Date('2023-04-25T00:00:00Z'),
          'string',
          true,
          null,
          [
            'string',
            true,
            null,
            Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
            new Date('2023-04-25T00:00:00Z'),
          ],
        ],
      },
      {
        Array: [
          'AAECAwQFBgcICQ==',
          1682380800000,
          'string',
          true,
          null,
          ['string', true, null, 'AAECAwQFBgcICQ==', 1682380800000],
        ],
        __t: {
          t: ['Buffer', 'Date'],
          i: {
            Array: [
              [0, 0],
              [1, 1],
              [
                5,
                [
                  [3, 0],
                  [4, 1],
                ],
              ],
            ],
          },
        },
      },
    ],
    [
      {
        Array: [
          {
            Buffer: Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
            Date: new Date('2023-04-25T00:00:00Z'),
            string: 'string',
            boolean: true,
            null: null,
          },
          {
            Buffer: Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
            Date: new Date('2023-04-25T00:00:00Z'),
            string: 'string',
            boolean: true,
            null: null,
          },
          Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
          new Date('2023-04-25T00:00:00Z'),
          null,
          true,
          'string',
        ],
      },
      {
        Array: [
          {
            Buffer: 'AAECAwQFBgcICQ==',
            Date: 1682380800000,
            string: 'string',
            boolean: true,
            null: null,
          },
          {
            Buffer: 'AAECAwQFBgcICQ==',
            Date: 1682380800000,
            string: 'string',
            boolean: true,
            null: null,
          },
          'AAECAwQFBgcICQ==',
          1682380800000,
          null,
          true,
          'string',
        ],
        __t: {
          t: ['Buffer', 'Date'],
          i: {
            Array: [
              [0, { Buffer: 0, Date: 1 }],
              [1, { Buffer: 0, Date: 1 }],
              [2, 0],
              [3, 1],
            ],
          },
        },
      },
    ],
    [
      {
        number: 1,
        string: 'string',
        boolean: true,
        null: null,
        Date: new Date('2023-04-25T00:00:00Z'),
        Buffer: Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
        Array: [
          Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
          new Date('2023-04-25T00:00:00Z'),
          'string',
          true,
          null,
        ],
        Object: {
          number: 1,
          string: 'string',
          boolean: true,
          null: null,
          Date: new Date('2023-04-25T00:00:00Z'),
          Buffer: Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
          Object: {
            number: 1,
            string: 'string',
            boolean: true,
            null: null,
            Date: new Date('2023-04-25T00:00:00Z'),
            Buffer: Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
            Array: [
              'string',
              true,
              Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
              new Date('2023-04-25T00:00:00Z'),
              null,
              [
                'string',
                true,
                Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
                new Date('2023-04-25T00:00:00Z'),
                null,
              ],
            ],
          },
        },
      },
      {
        number: 1,
        string: 'string',
        boolean: true,
        null: null,
        Date: 1682380800000,
        Buffer: 'AAECAwQFBgcICQ==',
        Array: ['AAECAwQFBgcICQ==', 1682380800000, 'string', true, null],
        Object: {
          number: 1,
          string: 'string',
          boolean: true,
          null: null,
          Date: 1682380800000,
          Buffer: 'AAECAwQFBgcICQ==',
          Object: {
            number: 1,
            string: 'string',
            boolean: true,
            null: null,
            Date: 1682380800000,
            Buffer: 'AAECAwQFBgcICQ==',
            Array: [
              'string',
              true,
              'AAECAwQFBgcICQ==',
              1682380800000,
              null,
              ['string', true, 'AAECAwQFBgcICQ==', 1682380800000, null],
            ],
          },
        },
        __t: {
          t: ['Date', 'Buffer'],
          i: {
            Date: 0,
            Buffer: 1,
            Array: [
              [0, 1],
              [1, 0],
            ],
            Object: {
              Date: 0,
              Buffer: 1,
              Object: {
                Date: 0,
                Buffer: 1,
                Array: [
                  [2, 1],
                  [3, 0],
                  [
                    5,
                    [
                      [2, 1],
                      [3, 0],
                    ],
                  ],
                ],
              },
            },
          },
        },
      },
    ],
  ] as [never, never][];

  test.each(cases)('serialize %p', (obj, expected) => {
    expect(new Joser().serialize(obj)).toEqual(expected);
  });

  test.each(cases)('deserialize %p', (output, input) => {
    expect(new Joser().deserialize(input)).toEqual(output);
  });

  describe('Custom Serializers', () => {
    class ObjectId {
      constructor(private value: Buffer) {}

      static generate() {
        return new ObjectId(randomBytes(12));
      }

      serialize() {
        return this.value;
      }

      deserialize(value: Buffer) {
        this.value = value;
      }
    }

    class Decimal {
      constructor(private value: number) {}

      serialize() {
        return this.value.toString();
      }

      deserialize(value: string) {
        this.value = parseFloat(value);
      }
    }

    test('custom serializer', () => {
      const value = {
        balance: new Decimal(1000),
        platform: ObjectId.generate(),
        account: ObjectId.generate(),
        gameRounds: [
          {
            id: ObjectId.generate(),
            bet: {
              balance: new Decimal(100),
              bonuses: [
                {
                  id: ObjectId.generate(),
                  amount: new Decimal(100),
                },
                {
                  id: ObjectId.generate(),
                  amount: new Decimal(200),
                },
              ],
            },
            dateTimeCreated: new Date(),
          },
        ],
      };
  
      const joser = new Joser({
        serializers: [
          {
            type: Decimal,
            name: 'Decimal',
            serialize(value: Decimal) {
              return value.serialize();
            },
            deserialize(serialized: number) {
              return new Decimal(serialized);
            },
          },
          {
            type: ObjectId,
            name: 'ObjectId',
            serialize(value: ObjectId) {
              return value.serialize();
            },
            deserialize(serialized: Buffer) {
              return new ObjectId(serialized);
            },
          },
        ],
      });
  
      console.dir(joser.serialize(value), { depth: 10 });
    });
  });
});
