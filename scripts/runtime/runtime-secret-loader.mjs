import { existsSync, readFileSync } from "node:fs";

const SECRET_NAME_PATTERN = /^[A-Z][A-Z0-9_]*$/;

function parseSecretNames(value) {
  if (!value) return [];

  return value
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name) => {
      if (!SECRET_NAME_PATTERN.test(name)) {
        throw new Error(`허용되지 않은 런타임 시크릿 이름입니다: ${name}`);
      }
      return name;
    });
}

function removeSingleTrailingLineBreak(value) {
  return value.replace(/\r?\n$/, "");
}

export function hydrateRuntimeSecrets({
  env = process.env,
  fileExists = existsSync,
  readFile = readFileSync,
} = {}) {
  const requiredNames = parseSecretNames(env.YEON_REQUIRED_SECRETS);
  const optionalNames = parseSecretNames(env.YEON_OPTIONAL_SECRETS);
  const requiredNameSet = new Set(requiredNames);
  const names = [...new Set([...requiredNames, ...optionalNames])];

  for (const name of names) {
    const fileVariableName = `${name}_FILE`;
    const filePath = env[fileVariableName]?.trim();
    let value = env[name];

    if (filePath) {
      if (!fileExists(filePath)) {
        throw new Error(`${name} 시크릿 파일을 찾지 못했습니다: ${filePath}`);
      }
      value = removeSingleTrailingLineBreak(readFile(filePath, "utf8"));
    }

    if (!value) {
      if (requiredNameSet.has(name)) {
        throw new Error(`${name} 필수 런타임 시크릿이 비어 있습니다.`);
      }
      continue;
    }

    env[name] = value;
  }

  return names;
}
