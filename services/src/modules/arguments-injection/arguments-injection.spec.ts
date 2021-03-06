import { RequestContext } from '../context';
import { inject } from './arguments-injection';

interface TestCase {
  input: unknown;
  source?: unknown;
  args?: Record<string, unknown>;
  context?: Pick<RequestContext, 'request' | 'exports'>;
  expected: unknown;
}

const testCases: [string, TestCase][] = [
  [
    'From source',
    {
      input: '{source.id}',
      source: { id: '1' },
      expected: '1',
    },
  ],
  [
    'From args',
    {
      input: '{args.isWorking}',
      args: { isWorking: true },
      expected: true,
    },
  ],
  [
    'From JWT',
    {
      input: '{jwt.email}',
      context: {
        request: {
          headers: {},
          decodeJWT() {
            return {
              header: {},
              payload: { email: 'something@domain.com' },
              signature: '',
            };
          },
        },
        exports: { resolve: () => ({}) },
      },
      expected: 'something@domain.com',
    },
  ],
  [
    'Deep inject object that contains objects and arrays',
    {
      input: {
        obj: { f1: 'v1', arg: '{args.argKey}' },
        arr: ['first', '{source.srcKey}'],
        inj: '{args.argKey}',
        static: 42,
      },
      args: { argKey: 'argVal' },
      source: { srcKey: 'srcVal' },
      expected: {
        obj: { f1: 'v1', arg: 'argVal' },
        arr: ['first', 'srcVal'],
        inj: 'argVal',
        static: 42,
      },
    },
  ],
  [
    'Deep inject array that contains objects and arrays',
    {
      input: [{ f1: 'v1', arg: '{args.argKey}' }, ['first', '{source.srcKey}'], '{args.argKey}', 42],
      args: { argKey: 'argVal' },
      source: { srcKey: 'srcVal' },
      expected: [{ f1: 'v1', arg: 'argVal' }, ['first', 'srcVal'], 'argVal', 42],
    },
  ],
];

describe('Argument Injection Tests', () => {
  test.each(testCases)('%s', (_, { input, source, args, context, expected }) => {
    const result = inject(input, source, args, context);
    expect(result).toEqual(expected);
  });
});
