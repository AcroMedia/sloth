/* eslint-disable arrow-parens */
/* eslint-disable arrow-body-style */
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import ProfileResults from '../../src/classes/ProfileResults';
import bench from '../../src/functions/bench';

chai.use(chaiAsPromised);

const { expect } = chai;

/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/require-await */

describe('bench', () => {
  it('ensures each type of function will be run properly', async () => {
    // Regular function
    function a() { return false; }
    expect(await bench(a)).to.be.a('object');

    // Regular async function
    async function b() { return false; }
    expect(await bench(b)).to.be.a('object');

    // Anon regular function
    expect(await bench(() => false)).to.be.a('object');

    // Async anon regular function
    expect(await bench(async () => false)).to.be.a('object');

    // Arrow function, with brackets
    const c = () => { return false; };
    expect(await bench(c)).to.be.a('object');

    // Arrow function, no brackets
    const d = () => false;
    expect(await bench(d)).to.be.a('object');

    // Async arrow function, with brackets
    const e = async () => { return false; };
    expect(await bench(e)).to.be.a('object');

    // Async arrow function, no brackets
    const f = async () => { return false; };
    expect(await bench(f)).to.be.a('object');

    // Anon arrow function, with brackets
    expect(await bench(() => { return false; })).to.be.a('object');

    // Anon arrow function, no brackets
    expect(await bench(() => false)).to.be.a('object');

    // Async anon arrow function, with brackets
    expect(await bench(async () => { return false; })).to.be.a('object');

    // Async anon arrow function, no brackets
    expect(await bench(async () => false)).to.be.a('object');

    // Function with args (wrapped)
    expect(await bench((x: number, y: number) => x + y, [1, 1])).to.be.a('object');

    // Function with args (not wrapped)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    expect(await bench(x => x, ['1'])).to.be.a('object');
  });

  it('tests setup function', async () => {
    expect(await bench(() => {}, [], {
      setup: () => {
        console.log('setup test');
        return null;
      },
    })).to.be.a('object');
  });

  it('tests requirements array', async () => {
    expect(await bench(() => {}, [], {
      requirements: [{
        name: 'fs',
        path: 'fs',
      }],
    })).to.be.a('object');
  });

  it('tests errors', () => {
    // @ts-expect-error: Purposely passing the wrong type for error checking
    expect(bench(() => {}, '')).to.be.rejected.and.be.an.instanceOf(Object);
    // @ts-expect-error: Purposely passing the wrong type for error checking
    expect(bench('')).to.be.rejected.and.and.be.an.instanceOf(Object);
  });

  it('ensures data consistency with small data', async () => {
    // Function to test
    function a() {
      // Fill up an array with one million 0s.
      const myBigArray = new Array(1e6).fill(1);
      myBigArray.reverse();
    }

    const results: ProfileResults = await bench(a, [], {}, {
      timestep: 100,
      toFile: false,
      waitAfterEnd: 1000,
      trimNodeProcessUsage: true,
    } as ProfilerOptions);

    // Converted to MB
    const peak = results.data.peak_usage_bytes / (1000 * 1000);

    expect(peak).to.be.lessThan(6);
    expect(peak).to.be.lessThan(14);
  });
});
