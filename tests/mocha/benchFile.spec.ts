import { expect } from 'chai';
import benchFile from '../../src/functions/benchFile';

describe('benchFile', () => {
  it('can read local paths', async () => {
    expect(await benchFile('tests/__threads__/1.js')).to.be.a('object');
  });

  it('can read absolute paths', async () => {
    expect(await benchFile(`${process.cwd()}/tests/__threads__/1.js`)).to.be.a('object');
  });
});
