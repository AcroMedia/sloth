import bench from '../src/functions/bench';
import benchFile from '../src/functions/benchFile';

jest.mock('../src/functions/bench', () => jest.fn((...args) => args));

describe('small data tests', () => {
  it('can read local paths', () => {
    expect(() => benchFile('./tests/__threads__/1.js')).not.toThrow();
  });

  it('can read absolute paths', () => {
    expect(() => benchFile(`${process.cwd()}/tests/__threads__/1.js`)).not.toThrow();
  });

  it('ensures args are passed to bench()', async () => {
    // @ts-expect-error Typescript doesn't like mocks
    const res = (await benchFile('./tests/__threads__/1.js', ['--node_test'], ['--cli_test']))[2];

    expect(bench).toHaveBeenCalled();

    expect(res.nodeArgs).toStrictEqual(['--node_test']);
    expect(res.cliArgs).toStrictEqual(['--cli_test']);
  });
});
