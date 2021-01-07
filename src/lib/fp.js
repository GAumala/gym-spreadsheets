const identity = x => x;

const compose = (...args) => {
  if (args.length < 1) 
    return

  const [ initial, ...fns ] = args.reverse();
  return fns.reduce((x, f) => f(x), initial);
}

module.exports = { identity, compose };
