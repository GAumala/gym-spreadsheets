/**
 * Wrapper class that takes a reporter, object with two methods:
 * report() and clear(), and returns a PromiseReporter, an object with chain:
 * report().whileDoing()
 */
class PromiseReporter {
  constructor(reporter) {
    this.delegate = reporter;
  }

  report(msg) {
    const { delegate } = this;

    const whileDoing = (promise) => {
      delegate.report(msg);
      return promise.finally(delegate.clear);
    };

    return { whileDoing };
  }
}

module.exports = PromiseReporter;
