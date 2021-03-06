import serial from 'serialize-javascript';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

/**
 * Convert a function to it's serialized internals
 */
export function getInternals(
  // eslint-disable-next-line @typescript-eslint/ban-types
  fn: Function | (() => unknown),
  args?: Array<string>,
): { fn: string, fnArgs: Array<any> } {
  const fnString = String(fn);
  let fnArgs: Array<string>;

  // Arrow function with no brackets?
  if (fnString.split('=>') && !fnString.split('=>')[0].includes('(')) {
    fnArgs = fnString.split('=>')[0].split(',');
  } else {
    fnArgs = fnString.split('(')[1].split(')')[0].split(',');
  }

  let internal = '';

  fnArgs = args && args.length > 0 ? fnArgs.map((a) => {
    // Make sure all args are serialized
    let val: string = serial(args[fnArgs.indexOf(a)] || '');

    if (Array.isArray(val) || typeof val === 'object') val = JSON.stringify(val);

    return `${a}=${val}`;
  }) : [];

  if (fnString.split(/\{/)[1]) {
    internal = fnString.split(/^(.*?)\{/gm)[2].slice(0, -1);
  } else {
    internal = `return ${fnString.split('=> ')[1]}` || '';
  }

  return { fn: internal, fnArgs };
}

/**
 * Creates a function that will automatically call itself when used in the JS Function() constructor
 */
export function wrap(str: string, args: Array<string>): string {
  return `(async (${args.join(',')}) => { ${str} })()`;
}
