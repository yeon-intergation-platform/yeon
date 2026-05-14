# dev-all AUTH_SECRET 동기화 작업 로그

- 시작: 2026-05-14 22:24 KST
- 완료: 2026-05-14 22:27 KST
- 목표: `apps/web/.env`에만 AUTH_SECRET이 있어도 `pnpm dev:all` 실행 시 Spring backend에 같은 값이 들어가도록 수정
- 범위: `scripts/dev-all.mjs`, 백로그/작업로그

## 구현

- 로컬 env 탐색 경로를 공통화했다.
- `AUTH_SECRET`을 process env 또는 로컬 env 파일에서 찾아 web/backend service env 양쪽에 주입한다.
- 없으면 로컬 개발 전용 fallback `local-dev-auth-secret`을 사용한다.
- 기존 `DATABASE_URL`, `SPRING_INTERNAL_TOKEN`, `SPRING_PROFILES_ACTIVE` 동작은 유지했다.

## 검증

- `node --check scripts/dev-all.mjs` 통과
- 로컬 env 탐색 확인: `AUTH_SECRET source=apps/web/.env`, web/backend injection true
- `git diff --check` 통과
- `pnpm lint` 통과
- `pnpm typecheck` 통과
