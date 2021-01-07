const Profiler = require('../src/classes/Profiler');

describe('small data tests', () => {
  it('ensures constructor works without options', () => {
    const prof = new Profiler(123);

    expect(prof.toWatch === 123).toBeTruthy();
    expect(prof.toFile).toBeFalsy();
    expect(prof.timestep === 100).toBeTruthy();
    expect(prof.wait === 0).toBeTruthy();
  });

  it('ensures options are applied correctly', () => {
    const prof = new Profiler(123, {
      timestep: 50,
      toFile: true,
      waitAfterEnd: 1000,
    });

    expect(prof.timestep === 50).toBeTruthy();
    expect(prof.toFile).toBeTruthy();
    expect(prof.wait === 1000).toBeTruthy();
  });

  it('ensures data consistancy with small data', async () => {
    const prof = new Profiler(process.pid, {
      timestep: 100,
      toFile: false,
      waitAfterEnd: 1000,
      trimNodeProcessUsage: true,
    });

    // Start the profiler. This will allow it to get baseline data for comparison.
    await prof.start();

    // Fill up an array with one million 0s.
    let myBigArray = new Array(1e6).fill(0);
    myBigArray.reverse();

    // Stop the profiler, get the data.
    const data = (await prof.end()).results;

    // Converted to MB
    const peak = data.peak_usage_bytes / (1000 * 1000);

    // Memory must be within 4 MB of potential error.
    expect(peak > 6 && peak < 10).toBeTruthy();
  });
});

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
    let myHugeArray = new Array(1e8).fill(0);
    myHugeArray.reverse();

    const data = (await prof.end()).results
    const peak = data.peak_usage_bytes / (1000 * 1000)

    console.log(peak)

    // Memory must be within 6 MB of potential error
    expect(peak > 1392 && peak < 1398).toBeTruthy();
  });
})
