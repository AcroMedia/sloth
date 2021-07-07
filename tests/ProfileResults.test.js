const colors = require('colors');
const mockData = {
  start: Date.now(),
  end: Date.now() + 1200,
  time_elapsed: 1200,
  timestep_ms: 100,
  mem_list: [
    32690176,
    32456704,
    32456704,
    32690176,
    32690176,
    32690176,
    32690176,
    32690176,
    32690176,
    32690176,
    32690176,
    32690176
  ],
  start_usage_bytes: 32456704,
  peak_usage_bytes: 32690176,
  end_usage_bytes: 32690176,
  base_process_bytes: 32456704
};

jest.mock('fs', () => ({
  existsSync: jest.fn(() => true),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn((path, data) => ({ path, data })),
  readFileSync: jest.fn(path => JSON.stringify(mockData))
}));

const ProfileResults = require('../src/classes/ProfileResults');

colors.disable();

describe('ProfileResults', () => {
  it('tests class functions', () => {
    const results = new ProfileResults(mockData);

    expect(results.averageMemoryUsage()).toBe(32651264);
    expect(results.medianMemoryUsage()).toBe(32456704);
    expect(results.modeMemoryUsage()).toBe(32690176);

    expect(results.memoryAtElapsed(200)).toBe(32456704);
    expect(results.memoryAtElapsed(800)).toBe(32690176);

    expect(() => results.memoryAtElapsed(999999)).toThrow();
  });

  it('tests snapshotting', () => {
    const results = new ProfileResults(mockData);

    expect(() => results.saveSnapshot()).toThrow();

    const savedData = results.saveSnapshot('name', '/home/snapshots/');
    const parsed = JSON.parse(savedData.data);

    expect(savedData.path).toBe('/home/snapshots/name.json');

    // Data should essentially be duplicated
    Object.keys(mockData).forEach((key) => {
      expect(parsed[key]).toStrictEqual(mockData[key]);
    });
  });

  it('tests snapshot comparison', () => {
    const results = new ProfileResults(mockData);
    const comparison = results.compareToSnapshot('');

    expect(comparison.time_elapsed).toBe(0);
    expect(comparison.start_usage_bytes).toBe(0);
    expect(comparison.peak_usage_bytes).toBe(0);
    expect(comparison.end_usage_bytes).toBe(0);

    // Test comparison by skewing the results a bit
    const skewData = {};
    Object.keys(mockData).forEach((key) => {
      if (typeof mockData[key] === 'number') {
        skewData[key] = mockData[key] + 10;
      }
    });
    const skewResults = new ProfileResults(skewData);
    const skewCompare = skewResults.compareToSnapshot('');

    expect(skewCompare.time_elapsed).toBe(10);
    expect(skewCompare.start_usage_bytes).toBe(10);
    expect(skewCompare.peak_usage_bytes).toBe(10);
    expect(skewCompare.end_usage_bytes).toBe(10);
  });

  it('tests diff logging', () => {
    const results = new ProfileResults(mockData);

    console.log = jest.fn();

    results.compareToSnapshot('', {
      logResultsDiff: true
    });

    expect(console.log.mock.calls[0][0]).toBe('Time elapsed: 0ms');
    expect(console.log.mock.calls[1][0]).toBe('Start usage bytes: -0 Bytes');
    expect(console.log.mock.calls[2][0]).toBe('Peak usage bytes: -0 Bytes');
    expect(console.log.mock.calls[3][0]).toBe('End usage bytes: -0 Bytes');
  });
});
