#!/usr/bin/env node
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import * as readline from "node:readline";

//#region src/index.ts
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const green = (text) => `\x1b[32m${text}\x1b[0m`;
const cyan = (text) => `\x1b[36m${text}\x1b[0m`;
const bold = (text) => `\x1b[1m${text}\x1b[0m`;
const dim = (text) => `\x1b[2m${text}\x1b[0m`;
async function main() {
	console.log();
	console.log(cyan("┌  ") + bold("OVS - A declarative UI syntax for Vue"));
	console.log(cyan("│"));
	let projectName = process.argv[2];
	if (!projectName) projectName = await prompt("│  Project name: ", "my-ovs-app");
	const targetDir = path.resolve(process.cwd(), projectName);
	if (fs.existsSync(targetDir)) {
		if (fs.readdirSync(targetDir).length > 0) {
			if (!await promptConfirm(`│  Directory "${projectName}" is not empty. Overwrite?`)) {
				console.log(cyan("│"));
				console.log(cyan("└  ") + "Operation cancelled");
				process.exit(0);
			}
			fs.rmSync(targetDir, {
				recursive: true,
				force: true
			});
		}
	}
	console.log(cyan("│"));
	console.log(cyan("│  ") + `Scaffolding project in ${targetDir}...`);
	copyDir(path.resolve(__dirname, "..", "template"), targetDir);
	replaceTemplateVariable(path.join(targetDir, "package.json"), projectName);
	replaceTemplateVariable(path.join(targetDir, "qin.config.js"), projectName);
	console.log(cyan("│"));
	console.log(cyan("└  ") + green("Done!") + " Now run:");
	console.log();
	console.log(`   ${bold(green(`cd ${projectName}`))}`);
	console.log(`   ${bold(green("qin install"))}`);
	console.log(`   ${bold(green("qin dev"))}`);
	console.log();
}
function prompt(message, defaultValue) {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	return new Promise((resolve) => {
		rl.question(message + dim(`(${defaultValue}) `), (answer) => {
			rl.close();
			resolve(answer.trim() || defaultValue);
		});
	});
}
function promptConfirm(message) {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	return new Promise((resolve) => {
		rl.question(message + dim(" (y/N) "), (answer) => {
			rl.close();
			resolve(answer.toLowerCase() === "y");
		});
	});
}
const EXCLUDED = [
	"node_modules",
	".git",
	"package-lock.json",
	"pnpm-lock.yaml",
	"yarn.lock"
];
function copyDir(src, dest) {
	fs.mkdirSync(dest, { recursive: true });
	for (const file of fs.readdirSync(src)) {
		if (EXCLUDED.includes(file)) continue;
		const srcPath = path.join(src, file);
		const destPath = path.join(dest, file);
		if (fs.statSync(srcPath).isDirectory()) copyDir(srcPath, destPath);
		else fs.copyFileSync(srcPath, destPath);
	}
}
function replaceTemplateVariable(filePath, projectName) {
	let content = fs.readFileSync(filePath, "utf-8");
	content = content.replaceAll("{{projectName}}", projectName);
	fs.writeFileSync(filePath, content);
}
main().catch((err) => {
	console.error(err);
	process.exit(1);
});

//#endregion
export {  };