import { red, green } from 'colors';
import fs from 'fs';
const _path = require('path');
const asciichart = require('asciichart');
const createChart = require('../helpers/createChart');

export default class ProfileResults {
  public data: {
    start: number,
    end: number,
    time_elapsed: number,
    timestep_ms: number,
    mem_list: Array<number>,
    start_usage_bytes: number,
    peak_usage_bytes: number,
    end_usage_bytes: number,
    base_process_bytes: number,
    last_updated: string
  };

  /**
   * Wraps the results of the Profiler into a class.
   *
   * Makes it easy to implement functions that
   * interact with the data.
   *
   * It is also helpful for providing useful jsdoc
   * definitions for the properties of the data.
   */
  constructor (data: any) {
    this.data = data;
  }

  /**
   * Get average memory usage.
   */
  public averageMemoryUsage () {
    let total: number = 0;
    this.data.mem_list.forEach((m: number) => {
      total += m;
    });

    return total / this.data.mem_list.length;
  }

  /**
   * Get median memory usage.
   */
  public medianMemoryUsage () {
    return this.data.mem_list.sort((a, b) => a - b)[Math.round(this.data.mem_list.length / 2)];
  }

  /**
   * Get most frequently occuring value in memory usage.
   */
  public modeMemoryUsage () {
    const freqMap: any = {};
    let maxCount = 0;
    let largest = null;

    this.data.mem_list.forEach((m) => {
      if (!freqMap[m]) freqMap[m] = 1;
      else freqMap[m] += 1;

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
  public memoryAtElapsed (ms: number) {
    if (ms > this.data.time_elapsed) throw new Error('Time provided was greater than total profile time.');

    return this.data.mem_list[Math.round(ms / this.data.timestep_ms)];
  }

  /**
   * Save data as a snapshot for comparison in future tests.
   */
  public saveSnapshot (filename: string, path = `${_path.resolve('.')}/__snapshots__/`) {
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
  public compareToSnapshot (path: string, options: {
    logResultsDiff?: boolean,
    graph?: string,
    graph_path?: string
  } = {}) {
    let obj;

    try {
      obj = JSON.parse(fs.readFileSync(path).toString());
    } catch (e) {
      // Create a new snapshot an compare to that ()
      const filename = path.split('/')[path.split('/').length - 1].split('.')[0];
      const folderPath = path.split(`${filename}.json`)[0];

      this.saveSnapshot(filename, folderPath);

      return {
        time_elapsed: 0,
        start_usage_bytes: 0,
        peak_usage_bytes: 0,
        end_usage_bytes: 0
      };
    }

    const comparison: any = {
      time_elapsed: this.data.time_elapsed - obj.time_elapsed,
      start_usage_bytes: this.data.start_usage_bytes - obj.start_usage_bytes,
      peak_usage_bytes: this.data.peak_usage_bytes - obj.peak_usage_bytes,
      end_usage_bytes: this.data.end_usage_bytes - obj.end_usage_bytes
    };

    if (options.logResultsDiff) {
      Object.keys(comparison).forEach((k) => {
        if (k === 'time_elapsed') return console.log(`Time elapsed: ${comparison[k] > 0 ? red(`+${comparison[k]}ms`) : green(`${comparison[k]}ms`)}`);
        return console.log(`${(k[0].toUpperCase() + k.substr(1)).replace(/_/g, ' ')}: ${comparison[k] > 0 ? `+${red(bytes(comparison[k]))}` : `-${green(bytes(-comparison[k]))}`}`);
      });
    }

    if (options.graph) {
      const chartData = [this.data.mem_list.map(n => n / 1024), obj.mem_list.map((n: number) => n / 1024)];

      if (options.graph === 'text') {
        // Graph memory chart
        console.log(asciichart.plot(chartData.sort((a, b) => a.length - b.length), {
          height: 10,
          colors: [
            this.data.mem_list.length > obj.mem_list.length ? asciichart.red : asciichart.blue,
            this.data.mem_list.length > obj.mem_list.length ? asciichart.blue : asciichart.red
          ]
        }), '\nBlue - Current Run\nRed - Snapshot Run');
      } else if (options.graph === 'image') {
        const imageName = `${Date.now()}.svg`;
        const imagePath = options.graph_path ? `${options.graph_path}/${imageName}` : `${_path.resolve('.')}/${imageName}`;

        createChart(chartData, imagePath);

        console.log(`Memory usage graph saved to ${imagePath}!`);
      }
    }

    return comparison;
  }
};

function bytes (val: number) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  if (val === 0) {
    return '0 Bytes';
  }

  const i: number = Math.floor(Math.log(val) / Math.log(1024));

  if (i === 0) {
    return `${val} ${sizes[i]}`;
  }

  return `${val / parseFloat((1024 ** i).toFixed(2))} ${sizes[i]}`;
}
