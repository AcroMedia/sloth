let func,
  args;

/* eslint-disable */
process.on('message', async (message) => {
  if (message.stage === 'preload') {
    // Convert serialized function to actual.
    if (message.func) func = Function(message.func);
    if (message.args) args = message.args;
    else args = [];

    process.send('preloaded');
  } else if (message.stage === 'start') {
    // Run with await in case of async.
    await func(...args);

    // Run JS garbage collector.
    global.gc();

    process.send('finish');
  }
});
