import { execCommand } from "../../app/app.js";
import { Spinner } from "./spinner.js";
import inquirer from "inquirer";

export class GitManager {
  constructor() {
    this.spinner = new Spinner();
  }

  /**
   * Checks if there are any uncommitted changes in the Git repository.
   * @returns {boolean} True if there are uncommitted changes, false otherwise.
   */
  hasChanges() {
    const status = execCommand("git status --porcelain");
    return status.trim().length > 0;
  }

  /**
   * Prompts the user to confirm and then discards all uncommitted changes in the repository.
   * This method resets the working directory to the last commit and removes untracked files.
   * @returns {Promise<void>}
   */
  async abandonChanges() {
    const { discard } = await inquirer.prompt([
      {
        type: "confirm",
        name: "discard",
        message: "Are you sure you want to discard all changes?",
        default: false,
      },
    ]);

    if (discard) {
      this.spinner.start("Discarding all changes...");
      execCommand("git reset --hard HEAD");
      execCommand("git clean -fd");
      this.spinner.success("All changes have been discarded.");
    } else {
      this.logger.log("Operation cancelled. No changes were discarded.");
    }
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

  push(branch) {
    try {
      const has_changes = this.hasChanges();
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
