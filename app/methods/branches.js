import { execCommand } from "../../app/app.js";
import { GitManager } from "./git.js";
import { Logger } from "./logger.js";
import { createSpinner } from "nanospinner";
import chalk from "chalk";
import { sleep } from "./utility.js";

export class BranchManager {
  constructor() {
    this.git = new GitManager();
    this.logger = new Logger();
    this.spinner = createSpinner();
  }

  save() {
    if (!this.git.uncommittedChanges()) {
      this.logger.log("No changes to save.");
    }

    this.spinner.start(chalk.blue("Commiting changes..."));
    this.stageChanges();
    execCommand('git commit -m "."');
    this.spinner.success(chalk.green("Done!"));
  }

  currentBranch() {
    return execCommand("git rev-parse --abbrev-ref HEAD").trim();
  }

  push(branch) {
    const exists = this.remoteExists();

    if (exists) {
      this.spinner.start(chalk.blue(`Force pushing changes to ${branch}...`));
      execCommand(`git push --force origin ${branch}`);
    } else {
      this.spinner.start(chalk.blue(`Pushing to new remote for ${branch}...`));
      execCommand(`git push -u origin ${branch}`);
    }

    this.spinner.success(chalk.green("Done!"));
  }

  remoteExists(branch) {
    this.spinner.start(chalk.blue("Seeing if remote branch exists..."));
    const response = execCommand(`git ls-remote --heads origin ${branch}`).trim();
    this.spinner.success(chalk.green("Remote branch found!"));
    return response !== "";
  }

  stageChanges() {
    this.spinner.start(chalk.blue("Staging changes..."));
    execCommand("git add .");
    this.spinner.success(chalk.green("Done!"));
  }
}
