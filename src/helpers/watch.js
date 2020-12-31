const fs = require('fs');
const pidusage = require('pidusage');
const pid = process.argv[2];
const timestep = process.argv[3] || 100;
const writeToFile = process.argv[4] === 'true';

// Base memory object.
let memObj = {
  start: Date.now(),
  end: 0,
  time_elapsed: 0,
  timestep_ms: timestep,
  mem_list: [],
  start_usage_bytes: 0,
  peak_usage_bytes: 0,
  end_usage_bytes: 0
};

setInterval(async () => {
  let data = await pidusage(pid);
  memObj.memlist.push(data.memory);

  // First check?
  if (memObj.mem_list.length === 0) {
    memObj.start_usage_bytes = data.memory;
  }

  // Is this our highest amount of memory usage?
  if (memObj.peak_usage_bytes < data.memory) {
    memObj.peak_usage_bytes = data.memory;
  }
}, memObj.timestep_ms);

process.on('message', (message) => {
  if (message === 'stop') {
    memObj.end = Date.now();
    memObj.time_elapsed = memObj.end - memObj.start;

    // Use callbacks since exit handler doesn't like async.
    pidusage(pid, (err, data) => {
      // Set end usage bytes
      memObj.end_usage_bytes = data.memory;

      // TODO: Send back data OR write to file.
      if (writeToFile) {
        fs.writeFile('./memstats.json', JSON.stringify(memObj), 'utf8');
      }

      process.send(memObj);
    });
  }
});
