# Description

Memtrace (name not final) is a Node module created with the intention of allowing easy and versatile memory profiling in NodeJS scripts, projects, and tests.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Using the Profiler class](#using-the-profiler-class)
  - [Using the bench function](#using-the-bench-function)
  - [ProfileResults](#profileresults)

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

ES6 `import`s:
```js
import * as memtrace from 'memtrace'

// OR

import { Profiler, bench } from 'memtrace'
```

Using `require`s:
```js
const memtrace = require('memtrace')

// OR

const { Profiler, bench } = require('memtrace')
```
