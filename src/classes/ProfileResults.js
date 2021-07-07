require('colors');
const fs = require('fs');
const asciichart = require('asciichart');
const createChart = require('../helpers/createChart');

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
  constructor (data) {
    this.data = data;
  }

  /**
   * Get average memory usage.
   */
  averageMemoryUsage () {
    let total = 0;
    this.data.mem_list.forEach((m) => {
      total += m;
    });

    return total / this.data.mem_list.length;
  }

  /**
   * Get median memory usage.
   */
  medianMemoryUsage () {
    return this.data.mem_list.sort((a, b) => a > b)[Math.round(this.data.mem_list.length / 2)];
  }

  /**
   * Get most frequently occuring value in memory usage.
   */
  modeMemoryUsage () {
    const freqMap = {};
    let maxCount = 0;
    let largest = null;

    this.data.mem_list.forEach((m) => {
      if (!freqMap[m]) freqMap[m] = 1;
      else freqMap[m]++;

      if (freqMap[m] > maxCount) {
        maxCount = freqMap[m];
        largest = m;
      }
    });

    return largest;
  }

  /**
   * Get the amount of memory taken up at a certain point within the test.
   *
   * @param {Number} ms
   */
  memoryAtElapsed (ms) {
    if (ms > this.data.time_elapsed) throw new Error('Time provided was greater than total profile time.');

    return this.data.mem_list[Math.round(ms / this.data.timestep_ms)];
  }

  /**
   * Save data as a snapshot for comparison in future tests.
   *
   * @param {String} filename
   * @param {String} path
   */
  saveSnapshot (filename, path = `${require('path').resolve('.')}/__snapshots__/`) {
    if (!filename) throw Error('You must provide a file name.');

    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }

    // Mostly just for user reference, not checked in code at all
    this.data.last_updated = new Date().toLocaleString();

    return fs.writeFileSync(`${path + filename}.json`, JSON.stringify(this.data), 'utf8');
  }

  /**
   * Compare the current results to another snapshot.
   *
   * @param {String} path
   * @param {Object} options
   * @param {Boolean=} [options.logResultsDiff=false]
   * @param {String=} options.graph
   * @param {String=} options.graph_path
   */
  compareToSnapshot (path, options) {
    let obj,
      comparison;

    try {
      obj = JSON.parse(fs.readFileSync(path));
    } catch (e) {
      throw e;
    }

    comparison = {
      time_elapsed: this.data.time_elapsed - obj.time_elapsed,
      start_usage_bytes: this.data.start_usage_bytes - obj.start_usage_bytes,
      peak_usage_bytes: this.data.peak_usage_bytes - obj.peak_usage_bytes,
      end_usage_bytes: this.data.end_usage_bytes - obj.end_usage_bytes
    };

    if (options.logResultsDiff) {
      Object.keys(comparison).forEach((k) => {
        if (k === 'time_elapsed') return console.log(`Time elapsed: ${comparison[k] > 0 ? `+${comparison[k]}ms`.red : `${comparison[k]}ms`.green}`);
        console.log(`${(k[0].toUpperCase() + k.substr(1)).replace(/\_/g, ' ')}: ${comparison[k] > 0 ? `+${bytes(comparison[k])}`.red : `-${bytes(-comparison[k])}`.green}`);
      });
    }

    if (options.graph) {
      const chartData = [this.data.mem_list.map(n => n / 1024), obj.mem_list.map(n => n / 1024)];

      if (options.graph === 'text') {
        // Graph memory chart
        console.log(asciichart.plot(chartData.sort((a, b) => a.length > b.length), {
          height: 10,
          colors: [
            this.data.mem_list.length > obj.mem_list.length ? asciichart.red : asciichart.blue,
            this.data.mem_list.length > obj.mem_list.length ? asciichart.blue : asciichart.red
          ]
        }), '\nBlue - Current Run\nRed - Snapshot Run');
      } else if (options.graph === 'image') {
        const imageName = `${Date.now()}.svg`;
        const imagePath = options.graph_path ? `${options.graph_path}/${imageName}` : `${require('path').resolve('.')}/${imageName}`;

        createChart(chartData, imagePath);

        console.log(`Memory usage graph saved to ${imagePath}!`);
      }
    }

    return comparison;
  }
};

function bytes (bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  if (bytes == 0) {
    return '0 Bytes';
  }

  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));

  if (i == 0) {
    return `${bytes} ${sizes[i]}`;
  }

  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}
