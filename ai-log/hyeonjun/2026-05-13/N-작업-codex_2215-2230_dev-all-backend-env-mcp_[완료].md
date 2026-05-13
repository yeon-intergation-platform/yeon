### 작업 내역 (2026-05-13)

- 차수: dev:all Spring backend env 복구 및 MCP 연결 점검
  - 작업내용: `pnpm dev:all` 백엔드 로그의 실제 실패 원인(`DATABASE_URL 환경변수가 필요합니다.`)을 확인하고, dev-all이 `apps/web/.env`/`apps/backend/.env*`까지 DB URL 후보로 읽도록 수정한다. Postgres/Playwright MCP는 설정 파일/CLI 상태를 확인해 타임아웃 원인 범위를 정리한다.
  - 논의 필요: 없음
  - 선택지: root `.env` 강제 vs dev-all env 탐색 확장
  - 추천: dev-all env 탐색 확장
  - 사용자 방향: 추천 적용
  - 실행 상태: 완료
- 확인 근거:
  - `/home/osuma/coding_stuffs/yeon/.tmp/dev-all/backend.log`: `DATABASE_URL 환경변수가 필요합니다.`로 Spring bootRun 종료
  - `/home/osuma/coding_stuffs/yeon/apps/web/.env`: `DATABASE_URL` 존재 확인(값은 노출하지 않음)

- 수정 파일:
  - `scripts/dev-all.mjs`
  - `docs/product/backlog/dev-all-backend-database-env-resolution-2026-05-13.md`
  - `~/.codex/config.toml` (MCP startup timeout: playwright/postgres 60초로 조정, 저장소 커밋 대상 아님)
- 검증:
  - `pnpm --filter @yeon/web lint`
  - `pnpm --filter @yeon/web typecheck`
  - `pnpm --filter @yeon/web build`
  - `timeout --signal=SIGINT 70s pnpm dev:all --legacy` (web/race/mobile 기동, backend Gradle 시작, DATABASE_URL 누락 오류 미재현)
  - `claude mcp list` (playwright/postgres 연결 성공 확인)
