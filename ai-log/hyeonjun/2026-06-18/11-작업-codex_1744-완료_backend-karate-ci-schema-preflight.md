# 11 작업 - backend karate ci schema preflight

## 목표

- `Backend Tests & Reports / karate-flows`가 `public.users` 미존재 상태에서 seed SQL을 실행하지 못하게 만든다.
- 다음 에이전트가 backend test workflow를 수정하더라도 schema preflight 계약을 제거하면 CI에서 잡히게 한다.

## 확인한 실패 신호

- GitHub Actions 로그에서 `Seed traceability test user` 단계가 `INSERT INTO public.users ...` 실행 중 `ERROR: relation "public.users" does not exist`로 실패했다.
- 현재 workflow는 backend `/actuator/health`만 확인한 뒤 seed를 실행한다.
- `public.users`는 `V8__ensure_legacy_web_public_schema.sql`에서 생성되므로 seed 전에 Flyway 결과 확인이 필요하다.

## 진행 계획

- Karate backend 실행 포트를 run별 동적 포트로 분리한다.
- backend process PID를 확인하며 health를 기다린다.
- seed 전에 `information_schema.tables`로 `public.users` 존재를 반복 확인한다.
- 정적 검증 스크립트와 SSOT 검사 연결을 추가한다.

## 처리 결과

- `karate-flows` job에 실행별 backend 포트 선택을 추가해 self-hosted runner의 stale 8081 health를 재사용하지 않게 했다.
- backend PID를 저장하고 health 대기 중 process 종료를 즉시 실패로 처리하게 했다.
- `Seed traceability test user` 전에 `public.users` 존재를 확인하고, 없으면 Flyway schema history와 backend boot log를 출력하게 했다.
- `bin/verify-backend-ci-contract.mjs`를 추가하고 `ssot-check` 및 `verify-ssot.sh --project-only`에 연결했다.
- pre-commit hook의 staged Claude source 검사에서 `sed` 구분자와 정규식 alternation이 충돌하던 기존 잡음을 수정했다.

## 검증

- `node --check bin/verify-backend-ci-contract.mjs`: 통과
- `node bin/verify-backend-ci-contract.mjs`: 통과
- `/opt/homebrew/bin/actionlint .github/workflows/backend-tests.yml .github/workflows/ssot-check.yml`: 통과
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`: 통과
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`: 통과
- `pnpm exec prettier --check ...`: 통과
- `git diff --check`: 통과
- `sh -n .githooks/pre-commit`: 통과
