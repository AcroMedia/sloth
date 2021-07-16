# Description

Sloth is a Node module created with the intention of allowing easy and versatile memory profiling in NodeJS scripts, projects, and tests.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Documentation](#documentation)
  - [Using the Profiler class](#using-the-profiler-class)
  - [Using the bench function](#using-the-bench-function)
  - [Benchmarking a file](#benchmarking-a-file)
  - [ProfileResults](#profileresults)
- [Automated Testing Notes](#automated-testing-notes)
  - [Jest](#jest)

# Installation

- With npm:
  ```sh
  npm install sloth
  ```

- With yarn:
  ```sh
  yarn add sloth
  ```

# Usage

ES6 `import`s:
```js
import * as sloth from 'sloth'

// OR

import { Profiler, bench } from 'sloth'
```

Using `require`s:
```js
const sloth = require('sloth')

// OR

const { Profiler, bench, benchFile } = require('sloth')
```

For more detailed descriptions and code examples, see below:

---

## Documentation
- [Using the Profiler class](#using-the-profiler-class)
- [Using the bench function](#using-the-bench-function)
- [Benchmarking a file](#benchmarking-a-file)
- [ProfileResults](#profileresults)

## Using the Profiler class
The `Profiler` class is provided as a quick and easy way of profiling any application, provided you have it's PID, although it's aimed more towards profiling the application it's created in.

### Creating an instance
```js
const { Profiler } = require('sloth')
const profiler = new Profiler(pid, options)
```

Options are described below, all are optional:

| Option | Type | Description |
|--|--|--|
| toFile | `Boolean` (optional) | Whether to export the results to a file or not |
| timestep | `Number` (optional) | How long, in milliseconds, the memory monitor will check memory usage |
| wait | `Number` (optional) | How long, in milliseconds, the profiler should wait before returning results |
| trimNodeProcessUsage | `Boolean` (optional) | Takes the memory usage of the node process before anything has happened, and removes that from the data. Should allow for yielding more accurate results in most cases |

Methods are described below, all are async:

| Method | Description |
|--|--|
| start | Begins the profiling, returns itself |
| end | Stops profiling, returns instance of `ProfileResults`. See more about `ProfileResults` [here](#profileresults) |
### Examples

Creating a new Profiler instance that will keep track of it's own process's usage:
```js
const { Profiler } = require('sloth')
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

Using the Profiler within Jest
```js
const { Profiler } = require('sloth')

// Your Jest test suite
describe('test test', () => {
  // To make the tests cleaner, you should probably make them async
  it ('does something', async () => {
    const profiler = new Profiler(process.pid, {
      timestep: 100,
      wait: 1000,
      // This will shave off all of the memory currently
      // taken up by the Jest test. This way, it'll be more
      // accurate in case you just did a bunch of crazy
      // stuff before and didn't clean it all up properly.
      trimNodeProcessUsage: true
    })

    await profiler.start()

    // 100,000,000 zeros
    let myHugeArr = new Array(1e8).fill(0)

    const results = (await profiler.end()).results
    
    // Should've taken less than 5 seconds
    // (I doubt it'd actually take that little time, but it's just an example)
    expect(results.time_elapsed < 5000).toBeTruthy()
  })
})
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
const { bench } = require('sloth')
await bench(function, arguments, options)
```

It will return a `ProfileResults` instance (see more about `ProfileResults` [here](#profileresults)).

For details on options, see [Using the Profiler class](#using-the-profiler-class), as this function uses the exact same options with one important addition:

| Option | Type | Description |
|--|--|--|
| setup | `Function` (optional) | Code to run in the "global" scope. Useful for `require()`s and other otherwise globally defined variables |
| requirements | `Array` (optional) | A nicer alternative to `setup`. Each item should be an object with a `name` (what it's defined as) and `path` (what is actually `require`ed) |

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

Using a requirements array
```js
// Using a package
function f() {
  filesystem.writeFileSync('test.txt', 'test')
}

const results = await bench(f, [], {
  requirements: [
    {
      // Parsed as `const filesystem = require('fs')`
      name: 'filesystem',
      path: 'fs'
    }
  ]
})
```

### Extra Notes

When a thread is spawned, it is automatically run with the `--expose-gc` option and will always run `global.gc()` once everything has completed, but before the profiler is finished. This is to give a better insight on ending memory usage (`end_usage_bytes` in the `results` object.).

Obviously there are security implications when it comes to running code in a serialized-to-unserialized way, even if it's in a separate process and you have complete control of the code going in. Be careful as to how and where you use `bench()`, sometimes using the `Profiler` class will be safer.

## Benchmarking a file

The `benchFile()` function takes the existing `bench()` function and all it's fun function-wrappy goodness, and implements that for an entire file. It allows you to input a path as well as Node *AND* CLI options, which should allow you control over what exactly is run. This also returns an instance of `ProfileResults`.

It take three arguments:

| Option | Type | Description |
|--|--|--|
| path | `String` | The path to the file. This can be relative or absolute, although absolute is much more ideal. |
| nodeArgs | `Array` (optional) | An array of Node options, like `--expose-gc`. These are options passed to the Node process itself |
| cliArgs | `Array` (optional) | An array of CLI options. These are options likely found or used in your own code. |

### Examples

Benchmarking a single file

```js
const { benchFile } = require('sloth')

await benchFile('/home/project/myFile.js')
```

Benchmarking a file and providing some Node arguments

```js
await benchFile(__dirname + '/myFile.js/', [
  '--expose-gc',
  '--no-warnings'
])
```

Benchmarking a file and providing some CLI arguments

```js
await benchFile(__dirname + '/myFile.js', [], [
  '--do-ten-times',
  '-f',
  '--silent',
  '--input-dir=' + getSomeDir()
])
```

## ProfileResults

Once `Profiler.end()` or `bench()` is called, it will return a `ProfileResults` instance. This contains all of the profiling data, as well as some extra functions that should help aid in viewing and understanding the data.

The values in the `ProfileResults.data` property are outlined below:

| Property | Type | Description |
|----------|-------------|--|
| start | `Number` | The timestamp in milliseconds the profiling was started |
| end | `Number` | The timestamp in milliseconds the profiling finished |
| time_elapsed | `Number` | The amount of time profiling took, in milliseconds |
| timestep_ms | `Number` | The amount of milliseconds per memory check |
| mem_list | `Array` | List of memory values collected |
| start_usage_bytes | `Number` | The amount of bytes being used before or as profiling began |
| peak_usage_bytes | `Number` | The largest amount of memory being used at one time |
| end_usage_bytes | `Number` | The amount of memory being used by the end of the profile |
| base_process_bytes | `Number` | The amount of memory used by the process without anything having been done |

There are a few methods provided that should help make sense of some of the data:

| Method | Description |
|--------|-------------|
| averageMemoryUsage() | Get average memory usage throughout the whole profile |
| medianMemoryUsage() | Get middle memory usage, when list is sorted least to greatest or greatest to least |
| modeMemoryUsage() | Get most frequently occuring memory value |
| memoryAtElapsed(ms) | Get the amount of memory being used at a certain point in the profile |

### Extra Notes

If you intend on using this module in any automated testing, keep in mind that profiling may take different amounts of time on different machines. This could possibly skew averages and such, so stick to testing on more concrete values like `peak_usage_bytes`.

## Automated Testing Notes

### Jest

Jest coverage, handled by Istanbul, causes any code that is imported to be processed through a coverage watcher, which breaks the `bench` function when trying to bench a function from an outside module.

To fix `bench` breaking due to the coverage serialization, you will have to disable code coverage for your benchmarking tests. That, or use the `Profiler`.
