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
  uncommittedChanges() {
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
}
