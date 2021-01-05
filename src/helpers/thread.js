process.on('message', async ({ func, args }) => {
  // Convert serialized function to actual.
  if (func) func = new Function(func);

  // Run with await in case of async.
  await func(...args);

  // Run JS garbage collector.
  global.gc();
  
  process.send('finish');
});
