const identity = (x) => x;

const withValue = (x, f) => f(x);

const compose = (...args) => {
  if (args.length < 1) return;

  const [initial, ...fns] = args.reverse();
  return fns.reduce((x, f) => f(x), initial);
};

const reduceArrayToObject = (list, key) =>
  list.reduce((obj, item) => {
    obj[item[key]] = item;
    return obj;
  }, {});

const selectKeys = (...args) => {
  if (args.length === 0) return undefined;
  const src = args[0];

  return args.slice(1).reduce((obj, key) => {
    obj[key] = src[key];
    return obj;
  }, {});
};

module.exports = {
  identity,
  compose,
  reduceArrayToObject,
  selectKeys,
  withValue,
};
