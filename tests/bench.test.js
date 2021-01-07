const bench = require('../src/functions/bench');

describe('small data tests', () => {
  it('ensures each type of function will be run properly', async () => {
    jest.setTimeout(10000);

    // Regular function
    function a() { return false };
    expect(typeof await bench(a)).toBe('object');

    // Regular async function
    async function b() { return false };
    expect(typeof await bench(b)).toBe('object');
    
    // Anon regular function
    expect(typeof await bench(function() { return false })).toBe('object');

    // Async anon regular function
    expect(typeof await bench(async function() { return false })).toBe('object');

    // Arrow function, with brackets
    const c = () => { return false };
    expect(typeof await bench(c)).toBe('object');

    // Arrow function, no brackets
    const d = () => false
    expect(typeof await bench(d)).toBe('object');

    // Async arrow function, with brackets
    const e = async () => { return false };
    expect(typeof await bench(e)).toBe('object');

    // Async arrow function, no brackets
    const f = async () => false
    expect(typeof await bench(f)).toBe('object');

    // Anon arrow function, with brackets
    expect(typeof await bench(() => { return false })).toBe('object');

    // Anon arrow function, no brackets
    expect(typeof await bench(() => false)).toBe('object');

    // Async anon arrow function, with brackets
    expect(typeof await bench(async () => { return false })).toBe('object');

    // Async anon arrow function, no brackets
    expect(typeof await bench(async () => false)).toBe('object');
  });

  it('ensures data consistancy with small data', async () => {

  });
});
