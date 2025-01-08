import { execCommand } from "../../app/app.js";
import { GitManager } from "./git.js";
import { Logger } from "./logger.js";
import chalk from "chalk";
import { Spinner } from "./spinner.js";

export class BranchManager {
  constructor() {
    this.git = new GitManager();
    this.logger = new Logger();
    this.spinner = new Spinner();
  }

  save() {
    if (!this.git.hasChanges()) {
      this.logger.log("No changes to save.");
    }

    this.spinner.start("Commiting changes...");
    this.git.stage();
    execCommand('git commit -m "."');
    this.spinner.success("Commiting changes... done!");

    const current_branch = this.currentBranch();
    this.push(current_branch);
  }

  currentBranch() {
    return execCommand("git rev-parse --abbrev-ref HEAD").trim();
  }

  branchExists(branch) {
    const remoteExist = this.git.remoteExists(branch);
    const localExist = this.git.localExists(branch);

    if (remoteExist && localExist) {
      this.logger.warn(`Branch '${branch}' exists both locally and remotely.`);
    } else if (remoteExist) {
      this.logger.warn(`Branch '${branch}' already exists remotely.`);
    } else if (localExist) {
      this.logger.warn(`Branch '${branch}' already exists locally.`);
    } else {
      this.logger.log(`Branch '${branch}' is available.`);
    }

    return remoteExist || localExist;
  }

  abandon() {
    try {
      this.spinner.start("Abandoning branch...");
      const current_branch = this.currentBranch();
    } catch (error) {}
  }

  checkout(branch) {
    const current_branch = this.currentBranch();
    execCommand(`git checkout ${branch}`);
  }

  new(branch) {
    const exists = this.branchExists(branch);
    if (exists) return;

    execCommand(`git checkout -b ${branch}`);
    this.push();
  }
}
