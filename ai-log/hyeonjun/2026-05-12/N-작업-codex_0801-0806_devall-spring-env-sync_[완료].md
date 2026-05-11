# dev:all Spring 환경 자동 연결 작업

## 목표

`pnpm dev:all`에서 web이 실제 할당된 Spring backend port와 동일한 내부 토큰을 자동 사용하게 고친다.

## 확인된 원인

- card-decks Spring client 기본 backend URL은 `http://127.0.0.1:8081`이다.
- `dev:all` 기본 backend port는 8080이고 mobile은 8081을 사용할 수 있다.
- Spring Security는 내부 토큰 인증을 요구한다.

## 진행

- 백로그 작성 완료.
- `scripts/dev-all.mjs` 수정 예정.

## 변경

- `scripts/dev-all.mjs`에서 backend 할당 포트로 `SPRING_BACKEND_BASE_URL`/`SPRING_BOOTSTRAP_BASE_URL`을 web에 자동 주입한다.
- web/backend 양쪽에 동일한 `SPRING_INTERNAL_TOKEN`을 주입한다.
- 사용자가 토큰을 지정하지 않으면 로컬 기본 토큰 `local-dev-internal-token`을 사용한다.

## 검증

- `node --check scripts/dev-all.mjs`
- `git diff --check`
