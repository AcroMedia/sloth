const bench = require('../src/functions/bench');

describe('small data tests', () => {
  it('ensures each type of function will be run properly', async () => {
    jest.setTimeout(10000);

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
  });

  it('ensures data consistency with small data', async () => {
    // Function to test
    function a () {
      // Fill up an array with one million 0s.
      const myBigArray = new Array(1e6).fill(0);
      myBigArray.reverse();
    }

    const results = await bench(a, [], {
      timestep: 100,
      toFile: false,
      waitAfterEnd: 1000,
      trimNodeProcessUsage: true
    });

    // Converted to MB
    const peak = results.data.peak_usage_bytes / (1000 * 1000);

    // Memory must be within 6 MB of potential error.
    expect(peak > 6 && peak < 12).toBeTruthy();
  });
});

describe('large data tests', () => {
  it('ensures data consistancy with big data', async () => {
    // Function to test
    function a () {
      // Fill up an array with one million 0s.
      const myBigArray = new Array(1e8).fill(0);
      myBigArray.reverse();
    }

    const results = await bench(a, [], {
      timestep: 100,
      toFile: false,
      waitAfterEnd: 1000,
      trimNodeProcessUsage: true
    });

    // Converted to MB
    const peak = results.data.peak_usage_bytes / (1000 * 1000);

    // Memory must be within 6 MB of potential error.
    expect(peak > 1200 && peak < 1206).toBeTruthy();
  });
});
