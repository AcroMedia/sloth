# Description

Memtrace (name not final) is a Node module created with the intention of allowing easy and versatile memory profiling in NodeJS scripts, projects, and tests.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Using the Profiler class](#using-the-profiler-class)
  - [Using the bench function](#using-the-bench-function)

# Installation

- With npm:
  ```sh
  npm install memtrace
  ```

- With yarn:
  ```sh
  yarn add memtrace
  ```

# Usage

There are two main components, the `Profiler` class and the `bench` function.

## Using the Profiler class
The `Profiler` class is provided as a quick and easy way of profiling any application, provided you have it's PID, although it's aimed more towards profiling the application it's created in.

### Creating an instance
```js
const { Profiler } = require('memtrace')
const profiler = new Profiler(pid, options)
```

Options are described below, all are optional:

| Option | Description |
|--|--|
| toFile | Boolean - whether to export the results to a file or not. |
| timestep | Number - How long, in milliseconds, the memory monitor will check memory usage |
| wait | Number - How long, in milliseconds, the profiler should wait before returning results. |
| trimNodeProcessUsage | Takes the memory usage of the node process before anything has happened, and removes that from the data. Should allow for yielding more accurate results in most cases |

Methods are described below, all are async:

| Method | Description |
|--|--|
| start | Begins the profiling, returns itself. |
| end | Stops profiling, populates `profiler.results` with data, returns itself. |
### Examples

Creating a new Profiler instance that will keep track of it's own process's usage:
```js
const { Profiler } = require('memtrace')
const profiler = new Profiler(process.pid, {
  timestep: 100,
  wait: 1000,
  // Helps since the profiler will likely skew the results otherwise
  trimNodeProcessUsage: true
})
```

Profiling the creation of a large array:
```js
await profiler.start()

// 100,000,000 zeros
let myHugeArr = new Array(1e8).fill(0)

const results = (await profiler.end()).results
console.log(results)
```
