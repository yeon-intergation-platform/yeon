# 커뮤니티 화면 품질 개선 사이클

## 목표

- 커뮤니티 서비스 하나만 범위로 고정하고, 실제 브라우저 화면 품질을 확인한 뒤 P0/P1 중 가장 작은 독립 묶음을 수정한다.

## 기준

- `docs/guides/design-screenshot-evidence.md`에 따라 전/후 또는 after 스크린샷을 남긴다.
- 디자인 시스템 자체는 변경하지 않는다.
- source of truth를 확인하고 추측으로 수정하지 않는다.

## 스크린샷 경로

- `ai-log/hyeonjun/2026-06-19/community-visual-quality-cycle-screenshots/`

## 검증 예정

- Playwright 실제 브라우저 확인
- 관련 lint/typecheck/test
- 필요 시 `pnpm verify:parity`

## 진행 상태

- 완료

## 확인한 문제

- 커뮤니티 feed 목록 API는 Spring 내부 토큰이 없는 단독 web dev 실행에서 403을 반환했다.
- 게스트 글 작성도 guest profile resolve 경로가 같은 토큰 누락을 갖고 있어 403으로 막혔다.
- feed 오류 상태에서 empty state가 같이 떠서 "오류"와 "게시글 없음"이 동시에 보였다.
- 홈 서비스 카드의 `운영 중` 배지는 초록 계열이었지만 대비가 약해 회색처럼 보였다.

## 수정

- `apps/web/src/server/spring-bff-client.ts`: 로컬 비운영 환경에서 `dev:all`과 같은 `local-dev-internal-token` fallback을 사용한다.
- `apps/web/src/server/chat-service-feed-spring-client.ts`, `apps/web/src/server/chat-service-auth-spring-client.ts`: 내부 토큰 헤더 조립을 공통 BFF 헤더 빌더로 통일한다.
- `apps/web/src/features/community/community-page.tsx`: feed 오류가 있으면 empty state를 숨긴다.
- `apps/web/src/features/landing-home/landing-home.tsx`: live `운영 중` 배지를 emerald 계열로 강화한다.
- `apps/backend/src/test/resources/karate/run-flows.sh`: 로컬 Karate seed 전에 `public.users` 존재를 확인하고, 없으면 즉시 실패한다.

## 스크린샷

- before: `ai-log/hyeonjun/2026-06-19/community-visual-quality-cycle-screenshots/before-community-home-desktop.png`
- before: `ai-log/hyeonjun/2026-06-19/community-visual-quality-cycle-screenshots/before-community-home-mobile.png`
- after: `ai-log/hyeonjun/2026-06-19/community-visual-quality-cycle-screenshots/after-community-home-desktop.png`
- after: `ai-log/hyeonjun/2026-06-19/community-visual-quality-cycle-screenshots/after-community-empty-write-disabled-desktop.png`
- after: `ai-log/hyeonjun/2026-06-19/community-visual-quality-cycle-screenshots/after-community-created-desktop.png`
- after: `ai-log/hyeonjun/2026-06-19/community-visual-quality-cycle-screenshots/after-community-edited-desktop.png`
- after: `ai-log/hyeonjun/2026-06-19/community-visual-quality-cycle-screenshots/after-community-refresh-keeps-post-desktop.png`
- after: `ai-log/hyeonjun/2026-06-19/community-visual-quality-cycle-screenshots/after-community-deleted-desktop.png`
- after: `ai-log/hyeonjun/2026-06-19/community-visual-quality-cycle-screenshots/after-community-loading-state-desktop.png`
- after: `ai-log/hyeonjun/2026-06-19/community-visual-quality-cycle-screenshots/after-community-error-state-desktop.png`
- after: `ai-log/hyeonjun/2026-06-19/community-visual-quality-cycle-screenshots/after-community-home-mobile.png`
- after: `ai-log/hyeonjun/2026-06-19/community-visual-quality-cycle-screenshots/after-home-service-badges-desktop.png`
- report: `ai-log/hyeonjun/2026-06-19/community-visual-quality-cycle-screenshots/after-community-flow-report.json`

## 검증

- `curl http://localhost:3005/api/v1/chat-service/feed` -> 200
- `POST /api/v1/chat-service/feed` guest body -> 201
- Playwright actual browser flow: first entry, guest registration, disabled empty write, create, edit, refresh persistence, delete, loading, error, mobile -> pass, console errors 0, network failures 0
- `pnpm --filter @yeon/web lint` -> pass
- `pnpm --filter @yeon/web typecheck` -> pass
- `pnpm --filter @yeon/web test -- src/server/__tests__/spring-bff-client.test.ts src/server/__tests__/chat-service-feed-spring-client.test.ts src/server/__tests__/chat-service-auth-spring-client.test.ts src/server/__tests__/spring-client-header-guard.test.ts` -> 205 files, 888 tests passed
- `bash -n apps/backend/src/test/resources/karate/run-flows.sh` -> pass
- `git diff --check` -> pass
