# typing-decks route Spring pilot

## 결과
- `typing-decks` 6개 route lane Spring cutover 완료
- route layer direct `typing-decks-service` 의존 제거 완료
- default deck static catalog/detail/race-seed는 로컬 helper로 분리 유지

## 변경 파일
- backend
  - `apps/backend/src/main/java/world/yeon/backend/typing_decks/**`
  - `apps/backend/src/test/java/world/yeon/backend/typing_decks/**`
- web
  - `apps/web/src/server/typing-decks-spring-client.ts`
  - `apps/web/src/server/typing-deck-defaults.ts`
  - `apps/web/src/server/typing-race-seed.ts`
  - `apps/web/src/app/api/v1/typing-decks/**`
- docs
  - `docs/product/backlog/spring-typing-decks-route-pilot.md`
  - `docs/architecture/spring-typing-decks-route-*.md`

## 검증
- `./gradlew test --tests 'world.yeon.backend.typing_decks.*'` ✅
- `pnpm --filter @yeon/web exec vitest run 'src/app/api/v1/typing-decks/__tests__/route.test.ts' 'src/app/api/v1/typing-decks/__tests__/spring-route.test.ts' 'src/app/api/v1/typing-decks/[deckId]/__tests__/default-detail-route.test.ts' 'src/app/api/v1/typing-decks/[deckId]/__tests__/spring-route.test.ts' 'src/app/api/v1/typing-decks/[deckId]/passages/__tests__/route.test.ts' 'src/app/api/v1/typing-decks/[deckId]/passages/bulk/__tests__/route.test.ts' 'src/app/api/v1/typing-decks/[deckId]/passages/[passageId]/__tests__/route.test.ts' 'src/app/api/v1/typing-decks/[deckId]/race-seed/__tests__/route.test.ts'` ✅
- `pnpm --filter @yeon/web typecheck` ✅
- `pnpm --filter @yeon/web build` ✅
- `git diff --check` ✅
- `bash bin/sync-skills.sh --check` ✅
- `bash bin/verify-ssot.sh --project-only` ✅

## audit
- `rg -n "typing-decks-service|listTypingDecks\\(|createTypingDeck\\(|getTypingDeckDetail\\(|updateTypingDeck\\(|deleteTypingDeck\\(|createTypingDeckPassage\\(|createTypingDeckPassages\\(|updateTypingDeckPassage\\(|deleteTypingDeckPassage\\(|createTypingRaceSeed\\(" apps/web/src/app/api/v1/typing-decks` → no matches ✅

## 메모
- `apps/web/src/server/services/typing-decks-service.ts` 자체는 default deck/source 테스트와 회귀 참고용으로 아직 남겨둠
- build로 `apps/web/src/features/typing-service/characters/registry.generated.ts` 갱신됨
