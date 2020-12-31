const Profiler = require('../classes/Profiler');
const { fork } = require('child_process');

module.exports = async (func, args, opts) => {
  const child = fork(`${__dirname}/../helpers/thread.js`, ['--expose-gc']);
  const profiler = new Profiler(child.pid, opts);
  profiler.start();

  child.send({ func, args });

  child.kill();
  return await profiler.end();
};
