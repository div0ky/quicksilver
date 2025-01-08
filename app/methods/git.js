import { execCommand } from "../../app/app.js";
import { Spinner } from "./spinner.js";
import inquirer from "inquirer";

export class GitManager {
  constructor() {
    this.spinner = new Spinner();
  }

  init() {
    try {
      if (this.check()) {
        this.spinner.warn("Git repo already setup!");
        return true;
      }

      this.spinner.start("Initializing Git repository...");
      execCommand("git init");
      execCommand("git add .");
      execCommand('git commit -m "Initial commit"');
      this.spinner.success("Initializing Git repository... done!");
      return true;
    } catch (error) {
      this.spinner.error("Initializing Git repository... failed!");
      return false;
    }
  }

  check() {
    try {
      execCommand("git rev-parse --is-inside-work-tree");
      return true;
    } catch (error) {
      return false;
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

  stage() {
    try {
      this.spinner.start("Staging changes...");
      execCommand("git add .");
      this.spinner.success("Staging changes... done!");
    } catch (error) {
      this.spinner.error("Staging changes... failed!");
    }
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
}
