import chalk from "chalk";

export class Logger {
    constructor() {}

    log(message) {
        console.log(chalk.blue(message));
    }

    error(message) {
        console.error(chalk.red(message));
    }

    success(message) {
        console.log(chalk.green(message));
    }

    warn(message) {
        console.warn(chalk.yellow(message));
    }
}