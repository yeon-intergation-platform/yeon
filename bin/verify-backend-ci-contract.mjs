#!/usr/bin/env node
import { readFileSync } from "node:fs";

const workflowPath = ".github/workflows/backend-tests.yml";
const workflow = readFileSync(workflowPath, "utf8");

const requiredFragments = [
  ["isolated backend port step", "Prepare isolated backend port"],
  ["run-scoped backend port env", "KARATE_BACKEND_PORT"],
  ["karate base url env", "KARATE_BASE_URL"],
  ["backend pid env", "KARATE_BACKEND_PID"],
  ["backend run uses isolated port", "--server.port=${KARATE_BACKEND_PORT}"],
  ["schema preflight step", "Verify migrated schema before seeding"],
  ["public.users schema check", "table_schema = 'public'"],
  ["public.users table check", "table_name = 'users'"],
  ["flyway diagnostics", "yeon_backend.flyway_schema_history"],
  ["seed fails on sql error", "-v ON_ERROR_STOP=1"],
  ["script seed disabled in CI", 'KARATE_SEED_USER: "0"'],
  ["backend cleanup step", "Stop backend"],
];

let failed = false;

for (const [label, fragment] of requiredFragments) {
  if (!workflow.includes(fragment)) {
    console.error(`backend-tests.yml CI 계약 누락: ${label}`);
    failed = true;
  }
}

function assertOrder(beforeLabel, beforeFragment, afterLabel, afterFragment) {
  const beforeIndex = workflow.indexOf(beforeFragment);
  const afterIndex = workflow.indexOf(afterFragment);
  if (beforeIndex === -1 || afterIndex === -1 || beforeIndex >= afterIndex) {
    console.error(
      `backend-tests.yml CI 계약 순서 오류: ${beforeLabel} 단계는 ${afterLabel} 단계보다 앞에 있어야 합니다.`
    );
    failed = true;
  }
}

assertOrder(
  "PostgreSQL client 설치",
  "Install PostgreSQL client",
  "schema preflight",
  "Verify migrated schema before seeding"
);
assertOrder(
  "schema preflight",
  "Verify migrated schema before seeding",
  "traceability user seed",
  "Seed traceability test user"
);
assertOrder(
  "backend start",
  "Start backend (Java 25, dev.local) in background",
  "schema preflight",
  "Verify migrated schema before seeding"
);

if (failed) {
  process.exit(1);
}

console.log("backend-tests.yml CI 계약 OK");
