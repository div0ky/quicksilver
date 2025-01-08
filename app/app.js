import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import { execSync } from "child_process";

import { program } from "commander";

const rootDir = process.cwd();
const packageJsonPath = join(rootDir, "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
const current_version = packageJson.version;

export const execCommand = (command) => {
    return execSync(command, { encoding: 'utf-8' });
};

export const app = program.name("QuickSilver").description("CLI for streamlined Git workflow management").version(current_version);
