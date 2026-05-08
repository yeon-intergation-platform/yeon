# 56차 작업 — chat-service-friend-request spring pilot

- 시작: 19:15
- 목표: `/api/v1/chat-service/friends/requests` POST Spring cutover
- 범위: auth는 Next 유지, friend request mutation만 Spring 이동

- 결과: `/api/v1/chat-service/friends/requests` POST Spring cutover 완료
- 검증:
  - `./gradlew test --tests 'world.yeon.backend.chat_service_friend_requests.*'` ✅
  - `pnpm --filter @yeon/web exec vitest run 'src/app/api/v1/chat-service/friends/requests/__tests__/route.test.ts'` ✅
  - `pnpm --filter @yeon/web typecheck` ✅
  - `pnpm --filter @yeon/web build` ✅
  - `git diff --check` ✅
  - `bash bin/sync-skills.sh --check` ✅
  - `bash bin/verify-ssot.sh --project-only` ✅
- 메모: chat-service auth는 Next 유지, friend request mutation만 Spring 이동
