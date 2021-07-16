jest.mock('../src/functions/bench', () => jest.fn((...args) => args));

import bench from '../src/functions/bench';
import benchFile from '../src/functions/benchFile';

describe('small data tests', () => {
  it('can read local paths', () => {
    expect(() => benchFile('./tests/__threads__/1.js')).not.toThrow();
  });

  it('can read absolute paths', () => {
    expect(() => benchFile(`${process.cwd()}/tests/__threads__/1.js`)).not.toThrow();
  });

  it('ensures args are passed to bench()', async () => {
    const res = (await benchFile('./tests/__threads__/1.js', ['--node_test'], ['--cli_test']))[2];

    expect(bench).toHaveBeenCalled();

    expect(res.nodeArgs).toStrictEqual(['--node_test']);
    expect(res.cliArgs).toStrictEqual(['--cli_test']);
  });
});
