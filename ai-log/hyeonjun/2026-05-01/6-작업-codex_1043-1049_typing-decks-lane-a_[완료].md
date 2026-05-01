# Typing Decks Lane A 작업 로그

- 시작: 2026-05-01 KST
- 담당: Codex Lane A
- 범위: API contract, api-client methods, DB schema/migration, typing deck service, REST routes
- 상태: 완료

## 진행
- ralplan consensus/handoff 확인.
- 카드 덱 contract/service/route/schema 패턴 확인.
- typing decks/passages/race seed Zod 계약 추가.
- DB schema 및 0035 migration 추가.
- 정적 기본 한국어/영어 덱과 DB-backed user/public deck service 구현.
- optional-auth list/read, owner-only mutation, bulk passages, race-seed routes 구현.

## 검증
- pnpm --filter @yeon/api-contract typecheck: PASS
- pnpm --filter @yeon/api-client typecheck: PASS
- pnpm --filter @yeon/web lint -- src/server/services/typing-decks-service.ts src/server/db/schema/typing-decks.ts src/server/db/schema/typing-deck-passages.ts src/app/api/v1/typing-decks: PASS
- pnpm --filter @yeon/api-contract lint: PASS
- pnpm --filter @yeon/api-client lint: PASS
- git diff --check: PASS
- pnpm db:check:drift: PASS
- pnpm --filter @yeon/web typecheck: PASS

- pnpm --filter @yeon/web lint: PASS
- pnpm --filter @yeon/web build: PASS
- pnpm --dir apps/web exec vitest run src/server/services/__tests__/typing-decks-service.test.ts: PASS
