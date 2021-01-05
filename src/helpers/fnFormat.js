const literal = require('./literal');

module.exports = (fn, args) => {
  const fnString = String(fn);
  let fnArgs = fnString.split('(')[1].split(')')[0].split(',');
  let internal;

  fnArgs = fnArgs.map(a => {
    let val = literal(args[fnArgs.indexOf(a)] || null);

    return `${a}=${val}`;
  });

  if (fnString.split(/\{/)[1]) {
    internal = fnString.split(/\{/)[1].slice(0, -1);
  } else {
    internal = fnString.split('=> ')[1] || null;
  }

  const final = `((${fnArgs.join(',')}) => { ${internal} })()`;

  return final;
};
