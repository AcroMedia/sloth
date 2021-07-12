const fs = require('fs');
const bench = require('./bench');

/* eslint-disable */

/**
 * This function is just a bit of a shortcut to bench().
 *
 * It bascially just keeps you from having to fork the file for yourself
 * and create a manual profiler.
 *
 * @param {String} path
 * @param {Array=} nodeOpts
 * @param {Array=} cliOpts
 */
export default async (path: string, nodeArgs = [], cliArgs = []) => {
  let fullPath = path;

  // If our path isn't absolute, we will make it absolute using the CWD
  if (!path.startsWith('/')) {
    fullPath = `${process.cwd()}/${path}`;
  }

  let content = fs.readFileSync(fullPath).toString()

  // Wrap entire thing into a JS function, then pass it to `bench()`
  return bench(Function(content), [], {
    nodeArgs,
    cliArgs
  });
};
