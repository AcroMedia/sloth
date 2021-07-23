import { fork } from 'child_process';
import ProfileResults from '../classes/ProfileResults';

import Profiler from '../classes/Profiler';
import { getInternals, wrap } from '../helpers/fnFormat';

/**
 * Benchmarks a function in an isolated process.
 *
 * @param {Function} func
 * The function to benchmark.
 *
 * @param {Array=} args
 * The arguments to supply.
 *
 * @param {Object=} opts
 * Profiler options (see Profiler class).
 *
 * @param {Function=} opts.setup
 * Function that contians code that will run before the main function is run.
 *
 * Good for using require() and other things that are otherwise declared globally.
 *
 * @param {Array=} opts.requirements
 * Array of required packages. Good alternative to the setup function
 *
 * @param {Array=} opts.nodeArgs
 * Array of arguments to be passed to the Node process
 *
 * @param {Array=} opts.cliArgs
 * Array of args to pass to the file itself
 */
export default async (
  // eslint-disable-next-line @typescript-eslint/ban-types
  func: Function | (() => null),
  args: Array<unknown> = [],
  opts: BenchOptions = {},
  profilerOpts: ProfilerOptions = {},
):Promise<ProfileResults> => {
  const child = fork(`${__dirname}/../../dist/helpers/thread.js`, opts.cliArgs || [], {
    execArgv: ['--expose-gc'].concat(opts.nodeArgs || []),
  });

  if (!child.pid) throw Error('Child process was not assigned a PID');

  const profiler = new Profiler(child.pid, profilerOpts);
  // We have to redefine require() since the forked process doesn't do it for us :(
  let formatted = 'const require = global.process.mainModule.require;';
  let results: ProfileResults;

  // Argument type errors to prevent cryptic errors when formatting/passing stuff around.
  if (typeof func !== 'function') throw new TypeError('Function argument was not a function');
  if (!Array.isArray(args)) throw new TypeError('Arguments were not provided as an array');

  const internals = getInternals(func, args);

  // Do we have package requirements?
  if (opts.requirements && opts.requirements.length > 0) {
    // We have to add the ACTUAL project path in order to get modules from it
    // All other module paths are this dir, not the project dir
    let requires = `global.process.mainModule.paths.push("${process.cwd()}/node_modules");`;

    opts.requirements.forEach((r: { name: string, path: string }) => {
      requires += `const ${r.name} = require('${r.path}');`;
    });

    formatted += `${requires}`;
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
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  child.on('message', async (message: string): Promise<void> => {
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
