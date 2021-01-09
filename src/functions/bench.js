const Profiler = require('../classes/Profiler');
const { getInternals, wrap } = require('../helpers/fnFormat');
const { fork } = require('child_process');
const { format } = require('path');

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
 * 
 * @param {Function} opts.setup
 * Function that contians code that will run before the main function is run.
 * 
 * Good for using require() and other things that are otherwise declared globally.
 */
module.exports = async (func, args = [], opts = {}) => {
  const child = fork(`${__dirname}/../helpers/thread.js`, { execArgv: ['--expose-gc'] });
  const profiler = new Profiler(child.pid, opts);

  // Argument type errors to prevent cryptic errors when formatting/passing stuff around.
  if (typeof func !== 'function') throw new TypeError('Function argument was not a function')
  if (!Array.isArray(args)) throw new TypeError('Arguments were not provided as an array')

  const internals = getInternals(func, args)
  let formatted = wrap(internals.fn, internals.fnArgs);
  let results;

  // Do we have a "setup" function?
  if (opts.setup && typeof opts.setup === 'function') {
    // Serialize the setup function
    const setupInternals = getInternals(opts.setup).fn
  
    // Prepend the internal function with setup code.
    formatted = setupInternals + ';\n' + formatted
  }

  // Send serialized function.
  child.send({ stage: 'preload', func: formatted, args });

  // Control of the profiler is given to the child process.
  child.on('message', async (message) => {
    if (message === 'preloaded') {
      // Start profiler first in order to allow the memory watcher to get baseline data.
      await profiler.start();
      child.send({ stage: 'start' })
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
