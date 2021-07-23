interface ProfilerOptions {
  toFile?: boolean,
  timestep?: number,
  waitAfterEnd?: number,
  trimNodeProcessUsage?: boolean
}

/**
 * The object that will contain all of the data found in ProfileResults
 */
interface ResultData {
  start: number,
  end: number,
  time_elapsed: number,
  timestep_ms: number,
  mem_list: Array<number>,
  start_usage_bytes: number,
  peak_usage_bytes: number,
  end_usage_bytes: number,
  base_process_bytes: number,
  last_updated?: string
}

/**
 * The data found in a comparison, like in the ProfileResults snapshot comparison
 */
interface Comparison {
  time_elapsed: number,
  start_usage_bytes: number,
  peak_usage_bytes: number,
  end_usage_bytes: number,
  [key: string]: string | number
}
