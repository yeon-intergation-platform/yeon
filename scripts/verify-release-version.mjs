#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const cliArgs = process.argv.slice(2).filter((arg) => arg !== "--");
const tagName = cliArgs[0] ?? process.env.GITHUB_REF_NAME ?? "";
const packageJson = JSON.parse(readFileSync(resolve("package.json"), "utf8"));
const expectedTag = `v${packageJson.version}`;

if (!/^\d+\.\d+\.\d+$/.test(packageJson.version ?? "")) {
  console.error(
    `package.json version이 SemVer 형식이 아닙니다: ${packageJson.version}`
  );
  process.exit(1);
}

if (tagName !== expectedTag) {
  console.error(
    `릴리즈 태그와 package.json version이 다릅니다. tag=${tagName}, expected=${expectedTag}`
  );
  process.exit(1);
}

console.log(`release version ok: ${expectedTag}`);
