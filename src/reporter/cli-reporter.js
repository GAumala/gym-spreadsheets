const ora = require("ora");

const spinner = ora("Inicializando");

const report = (message) => {
  if (spinner.isSpinning) {
    spinner.text = message;
  } else {
    spinner.start(message);
  }
};

const clear = () => {
  spinner.stop();
};

module.exports = { report, clear };
