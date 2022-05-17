/* eslint-disable @typescript-eslint/ban-types */
let func: Function;
let args: Array<any>;

/* eslint-disable */
process.on('message', async (message: { stage: string, func: string, args: Array<string> }) => {
  if (message.stage === 'preload') {
    // Convert serialized function to actual.
    if (message.func) func = Function(message.func);
    if (message.args) args = message.args;
    else args = [];

    if (process.send) process.send('preloaded');
  } else if (message.stage === 'start') {
    // Run with await in case of async.
    try {
      await func(...args);
    } catch(e) {
      console.error(e);

      if (process.send) process.send('error');
    }

    // Run JS garbage collector.
    if (global.gc) global.gc();

    if (process.send) process.send('finish');
  }
});
