import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const serverDir = join(process.cwd(), "src/server");

function listSpringClientFiles() {
  return readdirSync(serverDir)
    .filter((fileName) => fileName.endsWith("spring-client.ts"))
    .map((fileName) => join(serverDir, fileName));
}

describe("Spring BFF client header guard", () => {
  it("fetch 옵션에서 init spread가 headers 뒤에 와서 인증 헤더를 덮지 않는다", () => {
    const offenders = listSpringClientFiles().filter((filePath) => {
      const source = readFileSync(filePath, "utf8");
      return /fetch\([\s\S]*?\{[\s\S]*?cache:\s*["']no-store["'][\s\S]*?headers\s*:[\s\S]*?\.\.\.init[\s\S]*?\}\s*\)/.test(
        source
      );
    });

    expect(
      offenders.map((filePath) => filePath.replace(`${serverDir}/`, ""))
    ).toEqual([]);
  });
});
