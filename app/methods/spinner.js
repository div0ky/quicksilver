import { createSpinner } from "nanospinner";
import chalk from "chalk";

export class Spinner {
  constructor() {
    this.spinner = createSpinner();
  }

  start(text) {
    this.spinner.start(chalk.blue(text));
  }

  success(text) {
    this.spinner.success(chalk.green(text));
  }

  error(text) {
    this.spinner.error(chalk.red(text));
  }

  warn(text) {
    this.spinner.warn(chalk.yellow(text));
  }
}
