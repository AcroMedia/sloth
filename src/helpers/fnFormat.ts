const serial = require('serialize-javascript');

/**
 * Convert a function to it's serialized internals
 */
module.exports.getInternals = (fn: Function, args: Array<any>) => {
  const fnString = String(fn);
  let fnArgs: Array<String>;

  // Arrow function with no brackets?
  if (fnString.split('=>') && !fnString.split('=>')[0].includes('(')) {
    fnArgs = fnString.split('=>')[0].split(',');
  } else {
    fnArgs = fnString.split('(')[1].split(')')[0].split(',');
  }

  let internal;

  fnArgs = args && args.length > 0 ? fnArgs.map((a) => {
    // Make sure all args are serialized
    let val = serial(args[fnArgs.indexOf(a)] || null);

    if (Array.isArray(val) || typeof val === 'object') val = JSON.stringify(val);

    return `${a}=${val}`;
  }) : [];

  if (fnString.split(/\{/)[1]) {
    internal = fnString.split(/^(.*?)\{/gm)[2].slice(0, -1);
  } else {
    internal = `return ${fnString.split('=> ')[1]}` || null;
  }

  return { fn: internal, fnArgs };
};

/**
 * Creates a function that will automatically call itself when used in the JS Function() constructor
 */
module.exports.wrap = (str: string, args: Array<String>) => `(async (${args.join(',')}) => { ${str} })()`;
