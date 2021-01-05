module.exports.literal = (val) => {
  if (typeof val === 'string') val = `"${val.replace(/"/g, '\\"')}"`;
  if (typeof val === 'function') val = String(val);

  if (Array.isArray(val)) {
    val = val.map(v => this.literal(v, true));
  } else if (typeof val === 'object') {
    Object.keys(val).forEach(k => {
      val[k] = this.literal(val[k], true);
    });
  }

  return val;
};
