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
    this.spinner.success(chalk.green("Commiting changes... done!"));
  }

  currentBranch() {
    return execCommand("git rev-parse --abbrev-ref HEAD").trim();
  }

  push(branch) {
    try {
      const exists = this.remoteExists();

      if (exists) {
        this.spinner.start(chalk.blue(`Force pushing changes to ${branch}...`));
        execCommand(`git push --force origin ${branch}`);
      } else {
        this.spinner.start(chalk.blue(`Pushing to new remote for ${branch}...`));
        execCommand(`git push -u origin ${branch}`);
      }

      this.spinner.success(chalk.green(`Push to ${branch} is done!`));
    } catch (error) {
      this.spinner.error(chalk.red("Uh oh. We failed to push!"));
    }
  }

  remoteExists(branch) {
    try {
      this.spinner.start(chalk.blue("Seeing if remote branch exists..."));
      const response = execCommand(`git ls-remote --heads origin ${branch}`).trim();
      this.spinner.success(chalk.green("Remote branch found!"));
      return response !== "";
    } catch (error) {
      this.spinner.error(chalk.red("Uh oh. Something went wrong."));
    }
  }

  stageChanges() {
    try {
      this.spinner.start(chalk.blue("Staging changes..."));
      execCommand("git add .");
      this.spinner.success(chalk.green("Staging changes... done!"));
    } catch (error) {
      this.spinner.error(chalk.red("Staging changes... failed!"));
    }
  }

  stash(message = "QuickSilver: Temporary Stash") {
    try {
      this.spinner.start(chalk.blue("Stashing uncommmitted changes..."));
      execCommand(`git stash push -m "${message}"`);
      this.spinner.success(chalk.green("Stashing uncommmitted changes... done!"));
      return true;
    } catch (error) {
      this.spinner.error(chalk.red("Failed to stash changes!"));
    }
  }
}
