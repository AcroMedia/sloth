const serial = require('serialize-javascript');

/**
 * Convert a function to a serialized function.
 * 
 * Will automatically call itself when used in the JS Function() constructor.
 * 
 * @param {Function} fn 
 * @param {Array} args 
 */
module.exports = (fn, args) => {
  const fnString = String(fn);
  let fnArgs = fnString.split('(')[1].split(')')[0].split(',');
  let internal;

  fnArgs = args.length > 0 ? fnArgs.map(a => {
    // Make sure all args are serialized
    let val = serial(args[fnArgs.indexOf(a)] || null);

    if (Array.isArray(val) || typeof val === 'object') val = JSON.stringify(val);

    return `${a}=${val}`;
  }) : [];

  if (fnString.split(/\{/)[1]) {
    internal = fnString.split(/\{/)[1].slice(0, -1);
  } else {
    internal = 'return ' + fnString.split('=> ')[1] || null;
  }

  const final = `((${fnArgs.join(',')}) => { ${internal} })()`;

  return final;
};
