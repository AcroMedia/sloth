const Profiler = require('../classes/Profiler');
const fnFormat = require('../helpers/fnFormat');
const { fork } = require('child_process');

/**
 * Benchmarks a function in an isolated process.
 * 
 * @param {Function} func 
 * The function to benchmark.
 * 
 * @param {Array} args
 * The arguments to supply.
 * 
 * @param {Object} opts
 * Profiler options (see Profiler class). 
 */
module.exports = async (func, args = [], opts) => {
  const child = fork(`${__dirname}/../helpers/thread.js`, { execArgv: ['--expose-gc'] });
  const profiler = new Profiler(child.pid, opts);
  const formatted = fnFormat(func, args);
  let results;

  // Send serialized function.
  child.send({ func: formatted, args });

  // Control of the profiler is given to the child process.
  child.on('message', async (message) => {
    if (message === 'start') {
      profiler.start();
    } else if (message === 'finish') {
      results = await profiler.end();
      child.kill();
    }
  });
  
  // Wait until we have data back, then resolve.
  return new Promise((res) => {
    const intr = setInterval(() => {
      if (results) {
        clearInterval(intr);
        res(results);
      }
    }, 500);
  });
};
