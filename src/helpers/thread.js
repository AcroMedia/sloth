process.on('message', async ({ func, args }) => {
  // Convert serialized function to actual.
  if (func) func = Function(func);

  // Now that we're set up, ask the watcher to start.
  process.send('start');

  // Run with await in case of async.
  await func(...args);

  // Run JS garbage collector.
  global.gc();
  
  process.send('finish');
});
