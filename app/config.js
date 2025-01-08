import { CONFIG_FILENAME } from './constants.js';
import { execCommand } from './app.js';
import fs from "fs";
import path from 'path';


export class Config {
    constructor() {
        this._settings = this.load();
    }

    save(config) {
        const config_path = this.getConfigPath();
        fs.writeFileSync(config_path, JSON.stringify(config, null, 2));
    }

    getConfigPath() {
        const output = execCommand("git rev-parse --git-dir");
        const git_dir = output.trim();
        return path.join(git_dir, CONFIG_FILENAME);
    }

    load() {
        const config_path = this.getConfigPath();
        // if the file doesn't exist, provide empty object
        if (!fs.existsSync(config_path)) return {};
        const config_content = fs.readFileSync(config_path, "utf-8");
        return JSON.parse(config_content);
    }

    init() {
        const config = { setup: true, main_branch: 'main', setup_date: new Date().toISOString() };
        this.save(config);
    }

    get settings() {
        return this._settings;
    }
}

export default Config;