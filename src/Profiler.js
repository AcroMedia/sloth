const cp = require('child_process');

module.exports = class Profiler {
  /**
   * Class for profiling a process, provided a PID.
   * 
   * @param {Number} pid 
   */
  constructor(pid) {
    this.toWatch = pid;
    this.pid = null;
    this.results = null;
    this.process = null;
  }

  start() {
    this.process = cp.exec('node ./helpers/watch.js');
  }

  end() {
    // Setup our message handler for when the process sends the data.
    this.process.on('message', (message) => {
      console.log(message);
    });

    // Send 'stop' message which will give us our data.
    // Once we have the data, we can safely kill the process.
    this.process.send('stop');
  }
};
