const cp = require('child_process');

module.exports = class Profiler {
  /**
   * Class for profiling a process, provided a PID.
   * 
   * @param {Number} pid
   * @param {Object} opts
   */
  constructor(pid, opts = {}) {
    this.toWatch = pid;
    this.pid = null;
    this.results = null;
    this.process = null;
    
    // Optional params
    this.toFile = opts.toFile || false;
    this.timestep = opts.timestep || 100;
  }

  start() {
    this.process = cp.fork(`node ./helpers/watch.js ${this.pid} ${this.timestep} ${this.toFile}`);

    return this;
  }

  end() {
    // Setup our message handler for when the process sends the data.
    process.on('message', (message) => {
      console.log(message);
      this.results = message;
    });

    // Send 'stop' message which will give us our data.
    // Once we have the data, we can safely kill the process.
    this.process.send('stop');

    return this;
  }
};
