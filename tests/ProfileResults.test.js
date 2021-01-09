const ProfileResults = require('../src/classes/ProfileResults')

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
  base_process_bytes: 32456704,
}

describe('ProfileResults', () => {
  it('tests class functions', () => {
    const results = new ProfileResults(mockData)

    expect(results.averageMemoryUsage() === 32651264).toBeTruthy()
    expect(results.medianMemoryUsage() === 32456704).toBeTruthy()
    expect(results.modeMemoryUsage() === 32690176).toBeTruthy()

    expect(results.memoryAtElapsed(200) === 32456704).toBeTruthy()
    expect(results.memoryAtElapsed(800) === 32690176).toBeTruthy()

    expect(() => results.memoryAtElapsed(999999)).toThrow()
  })
})
