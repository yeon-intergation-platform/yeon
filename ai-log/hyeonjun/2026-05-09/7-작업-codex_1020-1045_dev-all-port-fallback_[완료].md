# dev-all port fallback

## 목표

- tmux 3pane `dev:all`에서 web/backend/mobile/race-server 포트 충돌 시 자동으로 다음 포트로 올린다.
- zsh `read-only variable: status` 오류를 제거한다.
- race-server window 존재를 tmux 메시지로 바로 알린다.

## 변경 파일

- `scripts/dev-all.mjs`
- `docs/product/backlog/spring-dev-all-backend-run.md`

## 작업 메모

- pane 종료 코드 변수명을 `status` -> `exit_code`로 바꿔 zsh reserved variable 충돌을 제거했다.
- 포트 선택은 `web=3000`, `backend=8081`, `mobile=8081`, `race-server=2567` 기본값에서 시작하되 이미 사용 중이거나 이번 실행에서 선점한 포트는 건너뛰게 했다.
- web 실행 env에 backend/race 실제 포트를 주입했다.
- mobile 실행 env에 web 실제 포트를 주입했다.
- race-server window는 유지하되 tmux `display-message`로 생성 위치와 포트 정보를 바로 보여주게 했다.
- 의존성 미설치 상황은 자동 설치하지 않고 pane 상단 경고로만 알린다.

## 검증

- `node --check scripts/dev-all.mjs`
- `git diff --check -- scripts/dev-all.mjs docs/product/backlog/spring-dev-all-backend-run.md ...`
- 현재 세션 기준 재실행 후 pane history에서 포트 할당 확인
  - web 3000
  - backend 8082
  - mobile 8084
  - race-server 2567
