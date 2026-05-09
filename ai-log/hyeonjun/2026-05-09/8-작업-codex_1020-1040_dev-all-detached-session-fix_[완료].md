# dev-all detached session fix

## 목표

- 사용자 별도 터미널에서 `pnpm dev:all` 실행 시 `can't find session: yeon-dev-all-*`로 즉시 종료되는 tmux 세션 버그를 고친다.

## 변경 파일

- `scripts/dev-all.mjs`
- `docs/product/backlog/spring-dev-all-backend-run.md`

## 작업 메모

- 원인 후보는 detached 세션 생성 직후 `bootstrap` window를 제거하면서 세션 자체가 사라지는 흐름이다.
- AI 세션에서는 `pnpm dev:all`을 직접 실행하지 않고, 스크립트 수정 + 정적 검증 + tmux 흐름 검토로 해결한다.
- `cleanupManagedWindows()`에서는 재실행 시 덮어써야 하는 `dev-all`, `race-server`만 정리하고 `bootstrap`은 건드리지 않게 바꿨다.
- `cleanupBootstrapWindow()`를 추가해 실제 서비스 window가 생성된 뒤에만 `bootstrap`을 제거하도록 순서를 분리했다.

## 검증

- `node --check scripts/dev-all.mjs`
- `git diff --check -- scripts/dev-all.mjs docs/product/backlog/spring-dev-all-backend-run.md ai-log/...`
- tmux 재현 체크
  - `before: bootstrap`
  - `mid: bootstrap dev-all`
  - `after: dev-all`
  - `session-survived:ok`
