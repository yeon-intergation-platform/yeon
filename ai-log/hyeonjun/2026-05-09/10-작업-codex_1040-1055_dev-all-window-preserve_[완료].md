# dev-all window preserve

## 목표
- `pnpm dev:all` 재실행 시 이전 실패 pane/window가 같은 tmux 세션에 그대로 남고, 새 실행은 별도 window로 추가되게 만든다.

## 변경 파일
- `scripts/dev-all.mjs`
- `docs/product/backlog/spring-dev-all-backend-run.md`

## 작업 메모
- 현재는 같은 세션에서 `dev-all`, `race-server` 이름을 고정 사용해 재실행 시 이전 창을 정리한다.
- 사용자 요구는 "그 터미널 세션에 그대로 실패 로그"이므로 window 이름을 run별로 분리하고 기존 cleanup을 제거한다.
- `clear`를 제거해 pane 진입 직후부터 첫 실패 로그가 바로 보이게 했다.
- main/race window 이름은 각각 `dev-all-<runId>`, `race-server-<runId>`로 바꿔 재실행 시 이전 실패 창이 그대로 남는다.
- 로그 파일도 `.logs/dev-all/<session>/<runId>/` 아래로 분리돼 run 간 섞이지 않는다.

## 검증
- `node --check scripts/dev-all.mjs`
- `git diff --check -- scripts/dev-all.mjs docs/product/backlog/spring-dev-all-backend-run.md ai-log/...`
- tmux window coexist 재현 체크
  - `bootstrap`
  - `dev-all-1`
  - `race-server-1`
  - `dev-all-2`
  - `race-server-2`
