import fs from 'fs';

import ProfileResults from '../classes/ProfileResults';
import bench from './bench';

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
export default async (
  path: string,
  nodeArgs: Array<string> = [],
  cliArgs: Array<string> = [],
): Promise<ProfileResults> => {
  let fullPath = path;

  // If our path isn't absolute, we will make it absolute using the CWD
  if (!path.startsWith('/')) {
    fullPath = `${process.cwd()}/${path}`;
  }

  const content = fs.readFileSync(fullPath).toString();

  // Wrap entire thing into a JS function, then pass it to `bench()`
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  return bench(Function(content), [], {
    nodeArgs,
    cliArgs,
  });
};
