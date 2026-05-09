# 4차 작업 — dev:all backend run

- 시작: 2026-05-09 09:50 KST
- 종료: 2026-05-09 09:53 KST
- 상태: 완료
- 목표: 루트 `pnpm dev:all`이 Spring Boot backend까지 함께 기동되도록 최소 수정한다.
- 근거:
  - 기존 `scripts/dev-all.mjs` services 배열에는 `web`, `mobile`, `race-server`만 존재
  - `apps/backend/gradlew`가 존재해 backend bootRun 진입점은 이미 준비됨
- 수행 내용:
  1. `scripts/dev-all.mjs`에 service별 `command`/`cwd` 지원을 추가
  2. `backend` service를 추가하고 `apps/backend`에서 `./gradlew bootRun`이 실행되도록 연결
  3. `node --check scripts/dev-all.mjs`로 문법 확인
  4. `timeout 20s pnpm dev:all` 스모크로 backend 로그 prefix와 Gradle 기동 시작 확인
- 검증 메모:
  - 스모크 중 `[backend:>] Starting a Gradle Daemon` 확인
  - 같은 스모크에서 web/mobile/race-server는 `node_modules` 부재로 기존 의존성 오류 발생 (`expo`, `tsx`, `drizzle-kit` not found)
  - 즉 backend 연결은 반영됐고, 전체 성공 실행은 의존성 설치 후 재검증 필요
