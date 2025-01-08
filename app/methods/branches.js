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
    if (!this.git.uncommittedChanges()) {
      this.logger.log("No changes to save.");
    }

    this.spinner.start("Commiting changes...");
    this.stageChanges();
    execCommand('git commit -m "."');
    this.spinner.success("Commiting changes... done!");

    this.push();
  }

  currentBranch() {
    return execCommand("git rev-parse --abbrev-ref HEAD").trim();
  }

  push(branch) {
    try {
      const has_changes = this.git.uncommittedChanges();
      if (has_changes) this.stageChanges();

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

  remoteExists(branch) {
    try {
      this.spinner.start("Seeing if remote branch exists...");
      const response = execCommand(`git ls-remote --heads origin ${branch}`).trim();
      this.spinner.success("Remote branch found!");
      return response !== "";
    } catch (error) {
      this.spinner.error("Uh oh. Something went wrong.");
    }
  }

  localExists(branch) {
    try {
      execCommand(`git rev-parse --verify ${branch}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  branchExists(branch) {
    const remoteExist = this.remoteExists(branch);
    const localExist = this.localExists(branch);

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

  stageChanges() {
    try {
      this.spinner.start("Staging changes...");
      execCommand("git add .");
      this.spinner.success("Staging changes... done!");
    } catch (error) {
      this.spinner.error("Staging changes... failed!");
    }
  }

  stash(message = "QuickSilver: Temporary Stash") {
    try {
      this.spinner.start("Stashing uncommmitted changes...");
      execCommand(`git stash push -m "${message}"`);
      this.spinner.success("Stashing uncommmitted changes... done!");
      return true;
    } catch (error) {
      this.spinner.error("Failed to stash changes!");
    }
  }

  abandon() {
    try {
      this.spinner.start("Abandoning branch...");
      const current_branch = this.currentBranch();
    } catch (error) {}
  }

  checkoutLocalBranch(branch) {
    if (this.localExists(branch)) {
      this.spinner.start(`Checking out local branch '${branch}'...`);
      execCommand(`git checkout ${branch}`);
      this.spinner.success(`Checked out local branch '${branch}'`);
    } else {
      this.spinner.warn(`Local branch '${branch}' does not exist`);
    }
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
