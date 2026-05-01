# Typing default deck 100 passage expansion

- 시작: 2026-05-01 11:35
- 완료: 2026-05-01 11:55
- 상태: 완료
- 범위: typing deck default data/service/tests only
- 목표: 한국어/영어 기본 타자 연습 덱을 각각 100개 이상으로 확장하고 서비스/API 노출 테스트 추가

## 진행
- 기본 덱 데이터를 서비스 전용 모듈로 분리하고 한국어/영어 각각 100개 original public-safe 문장 생성.
- list/detail 서비스 테스트와 list/detail API route 테스트로 양쪽 언어 모두 100개 이상 노출을 검증.

## 검증
- pnpm --filter @yeon/web exec vitest run src/server/services/__tests__/typing-decks-service.test.ts src/app/api/v1/typing-decks/__tests__/route.test.ts 'src/app/api/v1/typing-decks/[deckId]/__tests__/default-detail-route.test.ts' → PASS (3 files / 9 tests)
- pnpm --dir apps/web exec eslint src/server/services/default-typing-decks.ts src/server/services/typing-decks-service.ts src/server/services/__tests__/typing-decks-service.test.ts src/app/api/v1/typing-decks/__tests__/route.test.ts 'src/app/api/v1/typing-decks/[deckId]/__tests__/default-detail-route.test.ts' → PASS
- pnpm --filter @yeon/web typecheck → PASS
