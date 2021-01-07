const Profiler = require('../src/classes/Profiler');


describe('Profiler', () => {
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
})
