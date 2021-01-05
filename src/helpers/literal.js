module.exports = (val) => literal(val);

function literal(val) {
  if (typeof val === 'string') val = `"${val}"`;
  if (typeof val === 'object' || Array.isArray(val)) val = JSON.stringify(val);

  return val;
}
