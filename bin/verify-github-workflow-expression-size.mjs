#!/usr/bin/env node

import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const MAX_SAFE_EXPRESSION_SCALAR_LENGTH = 20_000;
const workflowDirectory = resolve(process.cwd(), ".github/workflows");
const workflowFiles = readdirSync(workflowDirectory)
  .filter((name) => name.endsWith(".yml") || name.endsWith(".yaml"))
  .sort();

const violations = [];

for (const workflowFile of workflowFiles) {
  const lines = readFileSync(
    resolve(workflowDirectory, workflowFile),
    "utf8"
  ).split("\n");

  for (let index = 0; index < lines.length; index += 1) {
    const blockStart = lines[index].match(
      /^(\s*)[^#\s][^:]*:\s*[>|][+-]?\s*(?:#.*)?$/
    );
    if (!blockStart) continue;

    const parentIndent = blockStart[1].length;
    const content = [];
    let cursor = index + 1;

    for (; cursor < lines.length; cursor += 1) {
      const line = lines[cursor];
      if (line.trim() !== "" && line.match(/^\s*/)[0].length <= parentIndent)
        break;
      content.push(line);
    }

    const scalar = content.join("\n");
    if (
      scalar.includes("${{") &&
      scalar.length > MAX_SAFE_EXPRESSION_SCALAR_LENGTH
    ) {
      violations.push(
        `${workflowFile}:${index + 1} 표현식이 포함된 block scalar가 ${scalar.length}자입니다.`
      );
    }

    index = cursor - 1;
  }
}

if (violations.length > 0) {
  console.error(
    "GitHub Actions의 21,000자 표현식 제한을 넘을 수 있는 workflow를 찾았습니다."
  );
  for (const violation of violations) console.error(`- ${violation}`);
  console.error(
    "Actions 컨텍스트 값은 step env로 전달하고 긴 run 본문에서는 일반 환경변수를 사용하세요."
  );
  process.exit(1);
}

console.log("GitHub workflow 표현식 크기 계약 통과");
