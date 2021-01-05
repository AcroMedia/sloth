const Profiler = require('../classes/Profiler');
const fnFormat = require('../helpers/fnFormat');
const { fork } = require('child_process');

module.exports = async (func, args = [], opts) => {
  const child = fork(`${__dirname}/../helpers/thread.js`, { execArgv: ['--expose-gc'] });
  const profiler = new Profiler(child.pid, opts);
  const formatted = fnFormat(func, args);
  let results;

  // Send serialized function
  child.send({ func: formatted, args });

  child.on('message', async (message) => {
    if (message === 'start') {
      profiler.start();
    } else if (message === 'finish') {
      results = await profiler.end();
      child.kill();
    }
  });
  
  return new Promise((res) => {
    const interval = setInterval(() => {
      if (results) {
        clearInterval(interval);
        res(results);
      }
    }, 500);
  });
};
