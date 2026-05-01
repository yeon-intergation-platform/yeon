# 타자방 온라인 플레이/레이스 무결성 보강

- 시작: 2026-05-01 12:03 KST
- 종료: 2026-05-01 12:12 KST
- 상태: 완료

## 작업 내용
- 공개 타자방 레이스 seed에 HMAC 기반 `seedToken`을 추가하고 race-server에서 검증하도록 보강.
- 비공개 덱 prompt가 공개 레이스 서버/lobby metadata로 새지 않도록 fallback 처리.
- 레이스 진행/완료 메시지를 LIVE 상태에서만 수락하고, 중복 finish와 client elapsed/finishedAt 신뢰 문제를 차단.
- 다른 참가자가 먼저 완료해도 아직 완료하지 않은 사용자의 입력창이 사라지지 않도록 결과 노출 조건 수정.
- 초대 링크 input을 노출해 E2E가 실제 생성된 room id로 게스트 입장을 검증하도록 개선.
- 온라인 E2E check 스크립트가 skip 성공처럼 보이지 않도록 명시 실패 안내로 변경.

## 검증
- `pnpm --filter @yeon/race-shared typecheck && pnpm --filter @yeon/api-contract typecheck && pnpm --filter @yeon/race-server typecheck && pnpm --filter @yeon/web typecheck` PASS
- `pnpm --filter @yeon/race-server lint && pnpm --filter @yeon/race-shared lint && pnpm --filter @yeon/api-contract lint && pnpm --filter @yeon/web lint` PASS
- `pnpm --filter @yeon/web exec vitest run src/server/auth/__tests__/admin.test.ts src/server/auth/__tests__/auth-user.test.ts src/server/services/__tests__/typing-decks-service.test.ts src/app/api/v1/typing-decks/__tests__/route.test.ts 'src/app/api/v1/typing-decks/[deckId]/__tests__/default-detail-route.test.ts'` PASS (5 files / 16 tests)
- `pnpm --filter @yeon/web db:check:drift` PASS
- `git diff --check` PASS
- `pnpm --filter @yeon/web build` PASS
- `RACE_SERVER_HTTP_URL=http://127.0.0.1:2567 pnpm --filter @yeon/web e2e:typing-room` PASS (1 browser spec)
