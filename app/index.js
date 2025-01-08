import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import { exec } from "child_process";
import util from "util";

import { program } from "commander";



const rootDir = process.cwd();
const packageJsonPath = join(rootDir, "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
const current_version = packageJson.version;

export const execAsync = util.promisify(exec);

export const app = program.name("QuickSilver").description("CLI for streamlined Git workflow management").version(current_version);
