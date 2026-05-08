# card-decks route Spring pilot

## 결과
- `card-decks` 7개 route lane Spring cutover 완료
- route layer direct `card-decks-service` 의존 제거 완료
- dead Next `card-decks-service.ts` / service test 삭제 완료

## 변경 파일
- backend
  - `apps/backend/src/main/java/world/yeon/backend/card_decks/route/**`
  - `apps/backend/src/test/java/world/yeon/backend/card_decks/route/**`
- web
  - `apps/web/src/server/card-decks-spring-client.ts`
  - `apps/web/src/app/api/v1/card-decks/**`
- 삭제
  - `apps/web/src/server/services/card-decks-service.ts`
  - `apps/web/src/server/services/__tests__/card-decks-service.test.ts`
- docs
  - `docs/product/backlog/spring-card-decks-route-pilot.md`
  - `docs/architecture/spring-card-decks-route-*.md`

## 검증
- `./gradlew test --tests 'world.yeon.backend.card_decks.route.*'` ✅
- `pnpm --filter @yeon/web exec vitest run 'src/app/api/v1/card-decks/__tests__/route.test.ts' 'src/app/api/v1/card-decks/study-preference/__tests__/route.test.ts' 'src/app/api/v1/card-decks/[deckId]/__tests__/route.test.ts' 'src/app/api/v1/card-decks/[deckId]/items/__tests__/items-routes.test.ts' 'src/app/api/v1/card-decks/merge-guest/__tests__/route.test.ts'` ✅
- `pnpm --filter @yeon/web typecheck` ✅
- `pnpm --filter @yeon/web build` ✅
- `git diff --check` ✅
- `bash bin/sync-skills.sh --check` ✅
- `bash bin/verify-ssot.sh --project-only` ✅

## audit
- `rg -n "card-decks-service|listCardDecks\\(|createCardDeck\\(|getCardDeckDetail\\(|updateCardDeck\\(|deleteCardDeck\\(|createCardDeckItem\\(|createCardDeckItems\\(|updateCardDeckItem\\(|deleteCardDeckItem\\(|getCardStudyPreference\\(|updateCardStudyPreference\\(|reviewCardDeckItem\\(" apps/web/src/app/api/v1/card-decks` → no matches ✅

## 메모
- build로 `apps/web/src/features/typing-service/characters/registry.generated.ts` 갱신됨
- merge-guest lane는 기존 Spring cutover 유지
