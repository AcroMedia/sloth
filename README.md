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
| end | Stops profiling, returns instance of `ProfileResults` |
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

### Extra Notes

Depending on how large the functionality being profiled is, you may want the keep the [Node garbage collector](https://rollout.io/blog/understanding-garbage-collection-in-node-js/) in mind. Consider the following example:

```js
await profiler.start()

// 100,000,000 zeros
let myHugeArr = new Array(1e8).fill(0)
myHugeArr = null

const results = (await profiler.end()).results
console.log(results)
```

While the array is set to null, the memory won't actually change unless the garbage collector is run. To change this, run your script with the `--expose-gc` flag, like so:

```sh
node --expose-gc index
```

And call the garbage collector:
```js
await profiler.start()

// 100,000,000 zeros
let myHugeArr = new Array(1e8).fill(0)
myHugeArr = null

// Important:
global.gc()

const results = (await profiler.end()).results
console.log(results)
```

## Using the bench function

The `bench()` function takes a function, throws it into a separate process, runs the profiler on the process, and wraps it all together complete with a bow on top\*.

<sub>* Disclaimer: does not actually provide a bow on top.</sub>

### Calling bench()
Calling the `bench()` function is done like so:
```js
const { bench } = require('memtrace')
await bench(function, arguments, options)
```

It will return the `Profiler` instance used for measurement.

For details on options, see [Using the Profiler class](#using-the-profiler-class), as this function uses the exact same options with one important addition:

| Option | Description |
|--|--|
| setup | Function - Code to run in the "global" scope. Useful for `require()`s and other otherwise globally defined variables. |

### Examples

\* FYI: The word "global" is often in quotes, as it technically isn't global, but instead in the outer scope of the function.

Setting up a test that measures the creation of a large array:
```js
function f() {
  let arr = new Array(1e8).fill(0)
}

// OR

const f = () => {
  let arr = new Array(1e8).fill(0)
}

const results = await bench(f, [], {
  // Less useful, since the process is basically isolated, but still a good idea
  trimNodeProcessUsage: true
})
```

Testing out an anonymous function:
```js
const results = bench(() => {
  console.log('I work!')
})

// OR

const results = bench(function() {
  console.log('I work!')
})
```

Using arguments:
```js
function log(text) {
  console.log(text)
}

const results = bench(log, ['I work!'])

// OR 

const results = bench((text) => console.log(text), ['I work!'])
```

Using a setup function:
```js
// Logging a "globally" defined variable
function f() {
  console.log(myVar)
}

const results = await bench(f, [], {
  setup: () => {
    let myVar = 'I work!'
  }
})
```
```js
// Using a module imported using require()
function f(data) {
  fs.writeFileSync('text.txt', data, 'utf8')
}

const results = await bench(f, ['I work!'], {
  setup: () => {
    const fs = require('fs')
  }
})
```
\* Linters will probably get pretty pissy at your setup functions, given they define variables that aren't used. Just a heads up.

### Extra Notes

When a thread is spawned, it is automatically run with the `--expose-gc` option and will always run `global.gc()` once everything has completed, but before the profiler is finished. This is to give a better insight on ending memory usage (`end_usage_bytes` in the `results` object.).

Obviously there are security implications when it comes to running code in a serialized-to-unserialized way, even if it's in a separate process and you have complete control of the code going in. Be careful as to how and where you use `bench()`, sometimes using the `Profiler` class will be safer.
