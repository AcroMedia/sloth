import Profiler from '../../src/classes/Profiler';
import ProfileResults from '../../src/classes/ProfileResults';

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
      waitAfterEnd: 1000,
    });

    expect(prof.timestep).toBe(50);
    expect(prof.toFile).toBeTruthy();
    expect(prof.wait).toBe(1000);
  });
});

jest.setTimeout(20000);

describe('large data tests', () => {
  it('ensures data consistancy with big data', async () => {
    const prof = new Profiler(process.pid, {
      timestep: 100,
      toFile: false,
      waitAfterEnd: 1000,
      trimNodeProcessUsage: true,
    });

    // This can take a lil while.
    jest.setTimeout(60000);

    await prof.start();

    // One hundred million 0s.
    const myHugeArray = new Array(1e8).fill(0);
    myHugeArray.reverse();

    const results: ProfileResults = await prof.end();
    const peak = results.data.peak_usage_bytes / (1000 * 1000);

    expect(peak).toBeGreaterThan(1190);
    expect(peak).toBeLessThan(1400);
  });
});
