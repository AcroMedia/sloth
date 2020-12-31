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
    this.results = null;
    this.process = null;
    
    // Optional params
    this.toFile = opts.toFile || false;
    this.timestep = opts.timestep || 100;
  }

  start() {
    this.process = cp.fork(`${__dirname}/helpers/watch.js`, [this.toWatch, this.timestep, this.toFile]);

    // Setup our message handler for when the process sends the data.
    this.process.on('message', (message) => {
      this.results = message;

      // Kill the watcher process.
      this.process.kill();
      this.process = null;
    });

    return this;
  }

  end() {
    // Send 'stop' message which will give us our data.
    // Once we have the data, we can safely kill the process.
    this.process.send('stop');

    return new Promise((res) => {
      const intr = setInterval(() => {
        if (!this.process) {
          clearInterval(intr);
          res(this);
        }
      }, 100);
    });
  }
};
