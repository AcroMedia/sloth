const Profiler = require('../classes/Profiler');
const { fork } = require('child_process');

module.exports = async (func, args, opts) => {
  const child = fork(`${__dirname}/../helpers/thread.js`, { execArgv: ['--expose-gc'] });
  const profiler = new Profiler(child.pid, opts);
  let results;

  profiler.start();

  child.send({ func, args });

  child.on('message', async () => {
    results = await profiler.end();
    child.kill();
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
