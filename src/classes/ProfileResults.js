module.exports = class ProfileResults {
  /**
   * Wraps the results of the Profiler into a class.
   * 
   * Makes it easy to implement functions that
   * interact with the data.
   * 
   * It is also helpful for providing useful jsdoc
   * definitions for the properties of the data.
   * 
   * @param {Object} data
   * 
   * @param {Number} data.start
   * When the profiling started.
   * 
   * @param {Number} data.end
   * When the profiling was stopped.
   * 
   * @param {Number} data.time_elapsed
   * The amount of time the profiler was active, in milliseconds.
   * 
   * @param {Number} data.timestep_ms
   * The amount of milliseconds that would pass before each memory check.
   * 
   * @param {Array} data.mem_list
   * The list of memory values throughout the test.
   * 
   * @param {Number} data.start_usage_bytes
   * The amount of bytes that the process took up when profiler started. 
   * 
   * @param {Number} data.peak_usage_bytes
   * The highest amount of memory usage.
   * 
   * @param {Number} data.end_usage_bytes
   * The amount of bytes the process took up when the profile was finished.
   * 
   * @param {Number} data.base_process_bytes
   * The amount of bytes the process took up without anything happening.
   */
  constructor(data) {
    this.data = data
  }

  /**
   * Get average memory usage.
   */
  averageMemoryUsage() {
    let total = 0
    this.data.mem_list.forEach(m => {
      total += m
    })

    return total/this.data.mem_list.length
  }

  /**
   * Get median memory usage.
   */
  medianMemoryUsage() {
    return this.data.mem_list.sort((a, b) => a > b)[Math.round(this.data.mem_list.length/2)]
  }

  /**
   * Get most frequently occuring value in memory usage.
   */
  modeMemoryUsage() {
    let freqMap = {}
    let maxCount = 0
    let largest = null

    this.data.mem_list.forEach(m => {
      if (!freqMap[m]) freqMap[m] = 1
      else freqMap[m]++

      if (freqMap[m] > maxCount) {
        maxCount = freqMap[m]
        largest = m
      }
    })

    return largest
  }

  /**
   * Get the amount of memory taken up at a certain point within the test.
   * 
   * @param {Number} ms 
   */
  memoryAtElapsed(ms) {
    if (ms > this.data.time_elapsed) throw new Error('Time provided was greater than total profile time.')

    return this.data.mem_list[Math.round(ms/this.data.timestep_ms)]
  }
}
