import { expect } from 'chai';
import Profiler from '../../src/classes/Profiler';

describe('Profiler', () => {
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
    const myBigArray = new Array(1e6).fill(0);
    myBigArray.reverse();

    // Stop the profiler, get the data.
    const results: ProfileResults = await prof.end();

    // Converted to MB
    const peak = results.data.peak_usage_bytes / (1000 * 1000);

    expect(peak).to.be.lessThan(6);
    expect(peak).to.be.lessThan(14);
  });
});
