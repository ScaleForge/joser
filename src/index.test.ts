import { Serializer } from '.';

describe('Serializer', () => {
  describe('serial data', () => {
    const cases = [
      [1, 1],
      ['string', 'string'],
      [true, true],
      [null, null],
      [new Date('2023-04-25T00:00:00Z'), 1682380800000],
      [Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]), '00010203040506070809'],
      [
        {
          number: 1,
          string: 'string',
          boolean: true,
          null: null,
          Date: new Date('2023-04-25T00:00:00Z'),
          Buffer: Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
        },
        {
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
        },
      ],
    ] as [unknown, unknown][];

    test.each(cases)('serialize %p', (input, output) => {
      const outputData = new Serializer().serialize(input);

      expect(outputData).toEqual(output);
    });
  });

  describe('deserialize data', () => {
    const cases = [
      [1, 1],
      ['string', 'string'],
      [true, true],
      [null, null],
      [
        {
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
        },
        {
          number: 1,
          string: 'string',
          boolean: true,
          null: null,
          Date: new Date('2023-04-25T00:00:00Z'),
          Buffer: Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
        },
      ],
    ] as [unknown, unknown][];

    test.each(cases)('deserialize %p', (input, output) => {
      expect(new Serializer().deserialize(input)).toEqual(output);
    });
  });
});
