import ProfileResults from '../src/classes/ProfileResults';
import bench from '../src/functions/bench';

jest.setTimeout(20000);

describe('small data tests', () => {
  it('ensures each type of function will be run properly', async () => {
    // Regular function
    function a () { return false; }
    expect(typeof await bench(a)).toBe('object');

    // Regular async function
    async function b () { return false; }
    expect(typeof await bench(b)).toBe('object');

    // Anon regular function
    expect(typeof await bench(() => false)).toBe('object');

    // Async anon regular function
    expect(typeof await bench(async () => false)).toBe('object');

    // Arrow function, with brackets
    const c = () => false;
    expect(typeof await bench(c)).toBe('object');

    // Arrow function, no brackets
    const d = () => false;
    expect(typeof await bench(d)).toBe('object');

    // Async arrow function, with brackets
    const e = async () => false;
    expect(typeof await bench(e)).toBe('object');

    // Async arrow function, no brackets
    const f = async () => false;
    expect(typeof await bench(f)).toBe('object');

    // Anon arrow function, with brackets
    expect(typeof await bench(() => false)).toBe('object');

    // Anon arrow function, no brackets
    expect(typeof await bench(() => false)).toBe('object');

    // Async anon arrow function, with brackets
    expect(typeof await bench(async () => false)).toBe('object');

    // Async anon arrow function, no brackets
    expect(typeof await bench(async () => false)).toBe('object');

    // Function with args (wrapped)
    expect(typeof await bench((x: any, y: any) => x + y, [1, 1])).toBe('object');

    // Function with args (not wrapped)
    expect(typeof await bench((x: any) => x, ['1'])).toBe('object');
  });

  it('ensures data consistency with small data', async () => {
    // Function to test
    function a () {
      // Fill up an array with one million 0s.
      const myBigArray = new Array(1e6).fill(0);
      myBigArray.reverse();
    }

    const results: ProfileResults = await bench(a, [], {
      timestep: 100,
      toFile: false,
      waitAfterEnd: 1000,
      trimNodeProcessUsage: true
    });

    // Converted to MB
    const peak = results.data.peak_usage_bytes / (1000 * 1000);

    expect(peak).toBeGreaterThan(6);
    expect(peak).toBeLessThan(14);
  });

  it('tests setup function', async () => {
    expect(async () => await bench(() => {}, [], {
      setup: () => {
        console.log('setup test');
      }
    })).not.toThrow();
  });

  it('tests requirements array', async () => {
    expect(async () => await bench(() => {}, [], {
      requirements: [{
        name: 'fs',
        path: 'fs'
      }]
    })).not.toThrow();
  });

  it('tests errors', async () => {
    // Not providing a proper function
    expect(async () => {
      // @ts-expect-error: Purposely passing the wrong type for error checking
      await bench('');
    }).rejects.toThrow();

    // Not providing arguments as array
    expect(async () => {
      // @ts-expect-error: Purposely passing the wrong type for error checking
      await bench(() => {}, '');
    }).rejects.toThrow();
  });
});

jest.setTimeout(20000);

describe('large data tests', () => {
  it('ensures data consistancy with big data', async () => {
    // Function to test
    function a () {
      // Fill up an array with one million 0s.
      const myBigArray = new Array(1e8).fill(0);
      myBigArray.reverse();
    }

    const results: ProfileResults = await bench(a, [], {
      timestep: 100,
      toFile: false,
      waitAfterEnd: 1000,
      trimNodeProcessUsage: true
    });

    // Converted to MB
    const peak = results.data.peak_usage_bytes / (1000 * 1000);

    expect(peak).toBeGreaterThan(1200);
    expect(peak).toBeLessThan(1210);
  });
});
