process.on('message', (message) => {
  if (message.func) {
    if (message.args) {
      message.func(...message.args);
    } else {
      message.func();
    }
  }

  global.gc();
});
