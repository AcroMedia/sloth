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

describe('ProfileResults', () => {
  it('tests class functions', () => {
    const results = new ProfileResults(mockData);

    expect(results.averageMemoryUsage() === 32651264).toBeTruthy();
    expect(results.medianMemoryUsage() === 32456704).toBeTruthy();
    expect(results.modeMemoryUsage() === 32690176).toBeTruthy();

    expect(results.memoryAtElapsed(200) === 32456704).toBeTruthy();
    expect(results.memoryAtElapsed(800) === 32690176).toBeTruthy();

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
  });
});
