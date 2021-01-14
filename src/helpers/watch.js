const fs = require('fs');
const pidusage = require('pidusage');
const pid = process.argv[2];
const timestep = process.argv[3] || 100;
const wait = process.argv[4] || 0;
const writeToFile = process.argv[5] === 'true';
const trim = process.argv[6] === 'true';

// Base memory object.
let memObj = {
  start: Date.now(),
  end: 0,
  time_elapsed: 0,
  timestep_ms: Number(timestep),
  mem_list: [],
  start_usage_bytes: 0,
  peak_usage_bytes: 0,
  end_usage_bytes: 0,
  base_process_bytes: 0,
};

// Check cycle
setInterval(async () => {
  let data = await pidusage(pid).catch(e => emergencyStop());

  // First check?
  if (memObj.mem_list.length === 0) {
    memObj.base_process_bytes = data.memory;
    memObj.start_usage_bytes = trim ? 0 : data.memory;
  }

  if (trim) data.memory -= memObj.base_process_bytes;

  // Push current memory usage
  memObj.mem_list.push(data.memory);

  // Is this our highest amount of memory usage?
  if (memObj.peak_usage_bytes < data.memory) {
    memObj.peak_usage_bytes = data.memory;
  }
}, memObj.timestep_ms);

process.on('message', (message) => {
  if (message === 'stop') {
    setTimeout(() => {
      memObj.end = Date.now();
      memObj.time_elapsed = memObj.end - memObj.start;
  
      // Use callbacks since exit handler doesn't like async.
      pidusage(pid, (err, data) => {
        // Set end usage bytes
        memObj.end_usage_bytes = trim ? data.memory - memObj.base_process_bytes : data.memory;
  
        // TODO: Send back data OR write to file.
        if (writeToFile) {
          fs.writeFile('./memstats.json', JSON.stringify(memObj), 'utf8', () => {
            process.send(memObj);
          });
        }
  
        process.send(memObj);
      });
    }, wait);
  }
});

function emergencyStop() {
  process.send(memObj);
}
