#!/usr/bin/env node

import { app, execAsync } from './app/index.js';

async function listBranches() {
    await execAsync("git branch");
}

app
  .command("list")
  .description("List all branches")
  .action(async () => listBranches());

// Make 'quick' the default command that shows help
app
  .command("quick")
  .description("QuickSilver CLI tool")
  .action(() => {
    app.help();
  });

app.parse(process.argv);