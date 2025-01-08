#!/usr/bin/env node

import { app, execCommand } from "./app/app.js";
import chalk from "chalk";
import { Config } from "./app/config.js";
import { BranchManager } from "./app/methods/branches.js";

const config = new Config();
const branch = new BranchManager();

function listBranches() {
  const output = execCommand("git branch");
  const branches = output
    .split("\n")
    .map((b) => b.trim().replace("*", "").trim())
    .filter(Boolean);
  console.log(chalk.blue("\nAvailable branches:"));
  branches.forEach((branch) => {
    console.log(chalk.green(`  • ${branch}`));
  });
}

function testConfig() {
  console.log("Initial config:", config.settings);
  config.settings.testKey = "testValue";
  config.saveConfig(config.settings);
  console.log("Updated config:", config.settings);
  delete config.settings.testKey;
  config.saveConfig(config.settings);
  console.log("Final config:", config.settings);
}

app
  .command("list")
  .description("List all branches")
  .action(() => listBranches());

app.command("test").description("Test Config File").action(testConfig);

app.command("save").description("Commit uncommitted changes").action(() => branch.save());

// Make 'quick' the default command that shows help
app
  .command("quick")
  .description("QuickSilver CLI tool")
  .action(() => {
    app.help();
  });

app.parse(process.argv);
