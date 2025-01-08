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
    if (!this.haveChanges()) {
      this.logger.log("No changes to save.");
    }

    this.spinner.start("Commiting changes...");
    this.git.stage();
    execCommand('git commit -m "."');
    this.spinner.success("Commiting changes... done!");

    const current_branch = this.currentBranch();
    this.git.push(current_branch);
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

  push(branch) {
    try {
      const has_changes = this.haveChanges();
      if (has_changes) this.stage();

      const exists = this.remoteExists();

      if (exists) {
        this.spinner.start(`Force pushing changes to ${branch}...`);
        execCommand(`git push --force origin ${branch}`);
      } else {
        this.spinner.start(`Pushing to new remote for ${branch}...`);
        execCommand(`git push -u origin ${branch}`);
      }

      this.spinner.success(`Push to ${branch} is done!`);
    } catch (error) {
      this.logger.error(error);
      this.spinner.error("Uh oh. We failed to push!");
    }
  }

  haveChanges() {
    const status = execCommand("git status --porcelain");
    return status.trim().length > 0;
  }

  async reset() {
    const { discard } = await inquirer.prompt([
      {
        type: "confirm",
        name: "discard",
        message: "Are you sure you want to discard all unsaved changes?",
        default: false,
      },
    ]);

    if (discard) {
      this.spinner.start("Discarding all unsaved changes...");
      execCommand("git reset --hard HEAD");
      execCommand("git clean -fd");
      this.spinner.success("All unsaved changes have been discarded.");
    } else {
      this.logger.log("Operation cancelled. No changes were discarded.");
    }
  }
}
