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
