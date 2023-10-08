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
          Object: {
            number: 1,
            string: 'string',
            boolean: true,
            null: null,
            Date: new Date('2023-04-25T00:00:00Z'),
            Buffer: Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
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
          },
        },
        __t: {
          t: ['Date', 'Buffer'],
          i: {
            Date: 0,
            Buffer: 1,
            Object: {
              Date: 0,
              Buffer: 1,
              Object: {
                Date: 0,
                Buffer: 1,
              },
            },
          },
        },
      },
    ],
  ] as [never, never ][];

  test.each(cases)('serialize %p', (obj, expected) => {
    expect(new Joser().serialize(obj)).toEqual(expected);
  });

  test.each(cases)('deserialize %p', (output, input) => {
    expect(new Joser().deserialize(input)).toEqual(output);
  });
});
