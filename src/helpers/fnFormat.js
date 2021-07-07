const serial = require('serialize-javascript');

/**
 * Convert a function to it's serialized internals
 *
 * @param {Function} fn
 * @param {Array} args
 */
module.exports.getInternals = (fn, args) => {
  const fnString = String(fn);
  let fnArgs;

  // Arrow function with no brackets?
  if (fnString.split('=>') && !fnString.split('=>')[0].includes('(')) {
    fnArgs = fnString.split('=>')[0].split(',');
  } else {
    fnArgs = fnString.split('(')[1].split(')')[0].split(',');
  }

  console.log(fnArgs);

  let internal;

  fnArgs = args && args.length > 0 ? fnArgs.map((a) => {
    // Make sure all args are serialized
    let val = serial(args[fnArgs.indexOf(a)] || null);

    if (Array.isArray(val) || typeof val === 'object') val = JSON.stringify(val);

    return `${a}=${val}`;
  }) : [];

  if (fnString.split(/\{/)[1]) {
    internal = fnString.split(/^(.*?)\{(.*)/g)[3].slice(0, -1);
  } else {
    internal = `return ${fnString.split('=> ')[1]}` || null;
  }

  return { fn: internal, fnArgs };
};

/**
 * Creates a function that will automatically call itself when used in the JS Function() constructor
 *
 * @param {String} str
 */
module.exports.wrap = (str, args) => `(async (${args.join(',')}) => { ${str} })()`;
