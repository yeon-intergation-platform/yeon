# 61차 작업 — chat-service-feed spring pilot

- 시작: 20:21
- 목표: `/api/v1/chat-service/feed*` Spring cutover
- 범위: auth는 Next 유지, feed read/write만 Spring 이동

- 결과: `/api/v1/chat-service/feed*` Spring cutover 완료
- 검증:
  - `./gradlew test --tests 'world.yeon.backend.chat_service_feed.*'` ✅
  - `pnpm --filter @yeon/web exec vitest run 'src/app/api/v1/chat-service/feed/__tests__/route.test.ts' 'src/app/api/v1/chat-service/feed/[postId]/replies/__tests__/route.test.ts'` ✅
  - `pnpm --filter @yeon/web typecheck` ✅
  - `pnpm --filter @yeon/web build` ✅
  - `git diff --check` ✅
  - `bash bin/sync-skills.sh --check` ✅
  - `bash bin/verify-ssot.sh --project-only` ✅
- 메모:
  - chat-service auth는 Next 유지
  - feed family read/write만 Spring 이동
