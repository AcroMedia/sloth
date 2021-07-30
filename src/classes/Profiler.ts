import cp, { ChildProcess, ForkOptions } from 'child_process';
import fs from 'fs';
import path from 'path';
import ProfileResults from './ProfileResults';

export default class Profiler {
  public toWatch: number;

  public results: null | ResultData;

  public process: null | ChildProcess;

  public toFile: boolean;

  public timestep: number;

  public wait: number;

  public trimNodeProcessUsage: boolean;

  /**
   * Class for profiling a process, provided a PID.
   *
   * @param {Number} pid
   * The process PID.
   *
   * @param {Object} opts
   * Profiler options.
   *
   * @param {Boolean=} opts.toFile
   * Whether to spit out the output into a JSON file.
   *
   * @param {Number=} opts.timestep
   * The amount of time in milliseconds before each memory check.
   *
   * @param {Number=} opts.waitAfterEnd
   * The amount of time to wait after the profiler has been stopped.
   *
   * @param {Boolean=} opts.trimNodeProcessUsage
   * Trim base node process usage from tracked usage.
   */
  constructor(pid: number, opts: ProfilerOptions | Record<string, null> = {}) {
    this.toWatch = pid;
    this.results = null;
    this.process = null;

    if (opts && typeof opts !== 'object') throw new Error('Provided options was not an object.');

    // Optional params
    this.toFile = opts.toFile || false;
    this.timestep = opts.timestep || 100;
    this.wait = opts.waitAfterEnd || 0;
    this.trimNodeProcessUsage = opts.trimNodeProcessUsage || true;
  }

  /**
   * Starts the watching process by spawning a fork of the monitoring file.
   */
  async start(): Promise<Profiler> {
    let execArgv: Array<string> = [];
    let procPath = path.join(__dirname, '../helpers/watch.js');

    if (!fs.existsSync(procPath)) {
      procPath = procPath.replace('.js', '.ts');
      execArgv = ['-r', 'ts-node/register'];
    }

    this.process = cp.fork(procPath, [
      this.toWatch as unknown as string,
      this.timestep as unknown as string,
      this.wait as unknown as string,
      this.toFile as unknown as string,
      this.trimNodeProcessUsage as unknown as string,
    ], {
      execArgv,
    });

    // Setup our message handler for when the process sends the data.
    this.process.on('message', (message: ResultData) => {
      this.results = message;

      // Kill the watcher process (if it hasn't already).
      if (this.process) this.process.kill();
      this.process = null;
    });

    // Ensure process can get an accurate baseline by waiting a few cycles before beginning.
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this);
      }, this.timestep * 3);
    });
  }

  /**
   * Kills the monitoring fork process, returns data.
   */
  end(): Promise<ProfileResults> {
    // Send 'stop' message which will give us our data.
    // Once we have the data, we can safely kill the process.
    if (this.process) this.process.send('stop');

    return new Promise((resolve) => {
      const intr = setInterval(() => {
        if (!this.process) {
          clearInterval(intr);
          resolve(new ProfileResults(this.results));
        }
      }, 100);
    });
  }
}
