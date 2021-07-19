import Profiler from '../src/classes/Profiler';

describe('small data tests', () => {
  it('ensures constructor works without options', () => {
    const prof = new Profiler(123);

    expect(prof.toWatch).toBe(123);
    expect(prof.toFile).toBeFalsy();
    expect(prof.timestep).toBe(100);
    expect(prof.wait).toBe(0);
  });

  it('ensures options are applied correctly', () => {
    const prof = new Profiler(123, {
      timestep: 50,
      toFile: true,
      waitAfterEnd: 1000
    });

    expect(prof.timestep).toBe(50);
    expect(prof.toFile).toBeTruthy();
    expect(prof.wait).toBe(1000);
  });

  it('ensures data consistancy with small data', async () => {
    const prof = new Profiler(process.pid, {
      timestep: 100,
      toFile: false,
      waitAfterEnd: 1000,
      trimNodeProcessUsage: true
    });

    // Start the profiler. This will allow it to get baseline data for comparison.
    await prof.start();

    // Fill up an array with one million 0s.
    const myBigArray = new Array(1e6).fill(0);
    myBigArray.reverse();

    // Stop the profiler, get the data.
    const results = await prof.end();

    // Converted to MB
    const peak = results.data.peak_usage_bytes / (1000 * 1000);

    expect(peak).toBeGreaterThan(6);
    expect(peak).toBeLessThan(14);
  });
});

jest.setTimeout(20000);

describe('large data tests', () => {
  it('ensures data consistancy with big data', async () => {
    const prof = new Profiler(process.pid, {
      timestep: 100,
      toFile: false,
      waitAfterEnd: 1000,
      trimNodeProcessUsage: true
    });

    // This can take a lil while.
    jest.setTimeout(60000);

    await prof.start();

    // One hundred million 0s.
    const myHugeArray = new Array(1e8).fill(0);
    myHugeArray.reverse();

    const results = await prof.end();
    const peak = results.data.peak_usage_bytes / (1000 * 1000);

    expect(peak).toBeGreaterThan(1190);
    expect(peak).toBeLessThan(1400);
  });
});
