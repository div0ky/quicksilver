import { execCommand } from "../../app/app.js";

export class GitManager {
    constructor() {}

    uncommittedChanges() {
        const status = execCommand("git status --porcelain");
        return status.trim().length > 0;
    }
}