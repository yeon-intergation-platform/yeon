#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const cliArgs = process.argv.slice(2).filter((arg) => arg !== "--");
const level = cliArgs[0];
const VALID_LEVELS = new Set(["major", "minor", "patch"]);

if (!VALID_LEVELS.has(level)) {
  console.error("사용법: pnpm version:bump -- <major|minor|patch>");
  process.exit(1);
}

const packagePath = resolve("package.json");
const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(packageJson.version ?? "");

if (!match) {
  console.error(
    `package.json version이 SemVer 형식이 아닙니다: ${packageJson.version}`
  );
  process.exit(1);
}

let [, majorText, minorText, patchText] = match;
let major = Number(majorText);
let minor = Number(minorText);
let patch = Number(patchText);

if (level === "major") {
  major += 1;
  minor = 0;
  patch = 0;
}

if (level === "minor") {
  minor += 1;
  patch = 0;
}

if (level === "patch") {
  patch += 1;
}

const nextVersion = `${major}.${minor}.${patch}`;
packageJson.version = nextVersion;
writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
console.log(`${match[0]} -> ${nextVersion}`);
