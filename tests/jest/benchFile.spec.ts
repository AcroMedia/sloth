import bench from '../../src/functions/bench';
import benchFile from '../../src/functions/benchFile';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

jest.mock('../../src/functions/bench', () => jest.fn((...args: Array<string>) => args));

describe('small data tests', () => {
  it('ensures args are passed to bench()', async () => {
    const res: {
      nodeArgs: string,
      cliArgs: string
      // @ts-expect-error Jest hates mocks
    } = (await benchFile('./tests/__threads__/1.js', ['--node_test'], ['--cli_test']))[2];

    expect(bench).toHaveBeenCalled();

    expect(res.nodeArgs).toStrictEqual(['--node_test']);
    expect(res.cliArgs).toStrictEqual(['--cli_test']);
  });
});
