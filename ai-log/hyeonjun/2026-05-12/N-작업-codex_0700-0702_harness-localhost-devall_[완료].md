# 하네스 로컬 확인 기준 SSOT 반영

## 목표

- PR/merge 후 CI/CD 대기 대신 개발자가 이미 켜둔 `pnpm dev:all`의 `http://localhost:3000/`에서 확인하도록 SSOT에 반영한다.
- 에이전트가 dev server를 직접 켜지 않고 개발자가 기동을 담당한다는 경계를 명시한다.

## 검증

- 진행 예정

## 완료 내용

- 하네스 SSOT에 사후 동작 확인 기준을 `http://localhost:3000/`으로 명시했다.
- dev server 기동은 개발자가 담당하고 에이전트가 직접 `pnpm dev:all`을 실행하지 않는 규칙을 추가했다.

## 검증

- 진행 예정

- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
