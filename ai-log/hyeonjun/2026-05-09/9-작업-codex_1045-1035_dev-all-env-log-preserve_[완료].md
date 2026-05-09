# dev-all env copy and log preserve

## 목표
- 원본 `../yeon`의 `apps/web/.env`, `apps/mobile/.env`를 rescue 작업트리로 복사해 web/mobile 즉시 종료 원인을 제거한다.
- `pnpm dev:all` 실패 시 pane가 바로 닫혀 원인 로그를 놓치지 않도록 pane 유지 + 파일 로그 보존 구조를 추가한다.

## 변경 파일
- `apps/web/.env`
- `apps/mobile/.env`
- `scripts/dev-all.mjs`
- `docs/product/backlog/spring-dev-all-backend-run.md`

## 작업 메모
- 사용자가 실패 원인으로 `.env` 누락을 직접 확인했으므로 해당 지시를 우선 반영한다.
- 이후에도 재발 시 로그가 남아야 하므로 tmux pane 내부 안내와 파일 로그 저장 경로를 함께 추가한다.
- `.env`는 원본 `../yeon/apps/web/.env`, `../yeon/apps/mobile/.env`에서 rescue 작업트리 동일 경로로 복사했다.
- `dev:all`은 각 서비스 출력을 `.logs/dev-all/<session>/` 아래 파일에도 저장하고, pane 종료 후 interactive shell을 유지하도록 했다.
- tmux `remain-on-exit`도 켜서 예기치 않은 종료 시 pane 자체도 남기게 했다.

## 검증
- `node --check scripts/dev-all.mjs`
- `git diff --check -- scripts/dev-all.mjs docs/product/backlog/spring-dev-all-backend-run.md ai-log/...`
- `tmux set-window-option -t <pane> remain-on-exit on` 재현 체크 → `remain-on-exit:on`
- `apps/web/.env`, `apps/mobile/.env` 복사 존재 확인
