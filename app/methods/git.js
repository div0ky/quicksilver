import { execCommand } from "../../app/app.js";
import { Spinner } from "./spinner.js";

export class GitManager {
  constructor() {
    this.spinner = new Spinner();
  }

  uncommittedChanges() {
    const status = execCommand("git status --porcelain");
    return status.trim().length > 0;
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
