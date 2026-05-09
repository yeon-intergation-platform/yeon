# dev-all tmux 3pane

## 목표

- `pnpm dev:all`을 tmux 기반으로 바꿔 web / backend / mobile 로그를 세로 3분할 pane에서 바로 보게 한다.
- race-server는 별도 window로 분리해 전체 서비스 실행은 유지하되 메인 로그 관찰성을 높인다.

## 변경 파일

- `scripts/dev-all.mjs`
- `docs/product/backlog/spring-dev-all-backend-run.md`

## 작업 메모

- 기존 `scripts/dev-all.mjs`의 단일 터미널 prefix 출력 방식을 tmux orchestration 방식으로 교체했다.
- 메인 window `dev-all`은 `web / backend / mobile` 3개의 세로 pane로 생성한다.
- `race-server`는 별도 tmux window로 생성해 3-pane 가독성을 유지했다.
- pane command는 서비스 종료 후 interactive shell로 남겨 원인 확인이 가능하게 했다.

## 검증

- `node --check scripts/dev-all.mjs`
- `node scripts/dev-all.mjs` 실행 후 tmux window/pane 확인
  - `dev-all` window 생성
  - `race-server` window 생성
  - `dev-all` layout: `72b9,80x23,0,0{26x23,0,0,10,26x23,27,0,12,26x23,54,0,11}`
- `git diff --check -- scripts/dev-all.mjs docs/product/backlog/spring-dev-all-backend-run.md ...`
