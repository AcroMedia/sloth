const { fork } = require('child_process');
const Module = require('module');
const serial = require('serialize-javascript');
const Profiler = require('../classes/Profiler');
const { getInternals, wrap } = require('../helpers/fnFormat');

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
 *
 * @param {Array} opts.requirements
 * Array of required packages. Good alternative to the setup function
 */
module.exports = async (func, args = [], opts = {}) => {
  const child = fork(`${__dirname}/../helpers/thread.js`, {
    execArgv: ['--expose-gc']
  });
  const profiler = new Profiler(child.pid, opts);
  let formatted = '';
  let results;

  // Argument type errors to prevent cryptic errors when formatting/passing stuff around.
  if (typeof func !== 'function') throw new TypeError('Function argument was not a function');
  if (!Array.isArray(args)) throw new TypeError('Arguments were not provided as an array');

  const internals = getInternals(func, args);

  // Do we have package requirements?
  if (opts.requirements && opts.requirements.length > 0) {
    // We have to add the ACTUAL project path in order to get modules from it
    // All other module paths are this dir, not the project dir
    let requires = `global.process.mainModule.paths.push("${process.cwd()}/node_modules");`;

    opts.requirements.forEach((r) => {
      requires += `const ${r.name} = global.process.mainModule.require('${r.path}');`;
    });

    internals.fn = `${requires}\n${internals.fn}`;
  }

  formatted += wrap(internals.fn, internals.fnArgs);

  // Do we have a "setup" function?
  if (opts.setup && typeof opts.setup === 'function') {
    // Serialize the setup function
    const setupInternals = getInternals(opts.setup).fn.replace(/^\s*/gm, '');

    // Prepend the internal function with setup code.
    formatted = `${setupInternals};\n${formatted}`;
  }

  // Send serialized function.
  child.send({ stage: 'preload', func: formatted, args });

  // Control of the profiler is given to the child process.
  child.on('message', async (message) => {
    switch (message) {
      case 'preloaded':
        // Start profiler first in order to allow the memory watcher to get baseline data.
        await profiler.start();
        child.send({ stage: 'start' });
        break;

      case 'finish':
      case 'error':
        results = await profiler.end();
        child.kill('SIGKILL');
        break;

      default:
        console.log(message);
        break;
    }
  });

  // Wait until we have data back, then resolve.
  return new Promise((resolve) => {
    const intr = setInterval(() => {
      if (results) {
        clearInterval(intr);
        resolve(results);
      }
    }, 500);
  });
};
