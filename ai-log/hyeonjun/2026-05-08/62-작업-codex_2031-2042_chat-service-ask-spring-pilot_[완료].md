# 62차 작업 — chat-service-ask spring pilot

- 시작: 20:31
- 목표: `/api/v1/chat-service/ask*` Spring cutover
- 범위: auth는 Next 유지, ask read/write/vote만 Spring 이동

- 결과: `/api/v1/chat-service/ask*` Spring cutover 완료
- 검증:
  - `./gradlew test --tests 'world.yeon.backend.chat_service_ask.*'` ✅
  - `pnpm --filter @yeon/web exec vitest run 'src/app/api/v1/chat-service/ask/__tests__/route.test.ts' 'src/app/api/v1/chat-service/ask/[postId]/vote/__tests__/route.test.ts'` ✅
  - `pnpm --filter @yeon/web typecheck` ✅
  - `pnpm --filter @yeon/web build` ✅
  - `git diff --check` ✅
  - `bash bin/sync-skills.sh --check` ✅
  - `bash bin/verify-ssot.sh --project-only` ✅
- 메모:
  - chat-service auth는 Next 유지
  - ask family read/write/vote만 Spring 이동
