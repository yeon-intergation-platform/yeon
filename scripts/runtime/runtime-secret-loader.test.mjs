import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { hydrateRuntimeSecrets } from "./runtime-secret-loader.mjs";

function withTempDirectory(run) {
  const directory = mkdtempSync(join(tmpdir(), "yeon-runtime-secret-"));
  try {
    return run(directory);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test("필수 시크릿을 파일에서 읽고 마지막 개행 하나만 제거한다", () => {
  withTempDirectory((directory) => {
    const filePath = join(directory, "AUTH_SECRET");
    writeFileSync(filePath, "file-secret\n");
    const env = {
      YEON_REQUIRED_SECRETS: "AUTH_SECRET",
      AUTH_SECRET_FILE: filePath,
    };

    hydrateRuntimeSecrets({ env });

    assert.equal(env.AUTH_SECRET, "file-secret");
  });
});

test("파일 경로가 없으면 직접 환경변수를 로컬 호환 경로로 사용한다", () => {
  const env = {
    YEON_REQUIRED_SECRETS: "AUTH_SECRET",
    AUTH_SECRET: "local-secret",
  };

  hydrateRuntimeSecrets({ env });

  assert.equal(env.AUTH_SECRET, "local-secret");
});

test("파일과 직접 환경변수가 모두 있으면 파일을 우선한다", () => {
  withTempDirectory((directory) => {
    const filePath = join(directory, "AUTH_SECRET");
    writeFileSync(filePath, "file-secret");
    const env = {
      YEON_REQUIRED_SECRETS: "AUTH_SECRET",
      AUTH_SECRET: "legacy-secret",
      AUTH_SECRET_FILE: filePath,
    };

    hydrateRuntimeSecrets({ env });

    assert.equal(env.AUTH_SECRET, "file-secret");
  });
});

test("필수 시크릿 파일이 없으면 값 없이 실패한다", () => {
  const env = {
    YEON_REQUIRED_SECRETS: "AUTH_SECRET",
    AUTH_SECRET_FILE: "/not-found/AUTH_SECRET",
  };

  assert.throws(
    () => hydrateRuntimeSecrets({ env }),
    /AUTH_SECRET 시크릿 파일을 찾지 못했습니다/
  );
});

test("빈 필수 시크릿은 즉시 실패한다", () => {
  const env = { YEON_REQUIRED_SECRETS: "AUTH_SECRET", AUTH_SECRET: "" };

  assert.throws(
    () => hydrateRuntimeSecrets({ env }),
    /AUTH_SECRET 필수 런타임 시크릿이 비어 있습니다/
  );
});

test("없는 선택 시크릿은 건너뛴다", () => {
  const env = { YEON_OPTIONAL_SECRETS: "OPENAI_API_KEY" };

  hydrateRuntimeSecrets({ env });

  assert.equal(env.OPENAI_API_KEY, undefined);
});

test("동적 이름 주입을 막는다", () => {
  const env = { YEON_REQUIRED_SECRETS: "AUTH_SECRET;echo" };

  assert.throws(
    () => hydrateRuntimeSecrets({ env }),
    /허용되지 않은 런타임 시크릿 이름/
  );
});
