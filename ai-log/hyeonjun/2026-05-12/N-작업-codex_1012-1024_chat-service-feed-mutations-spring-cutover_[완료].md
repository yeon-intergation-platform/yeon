# chat-service feed mutation Spring cutover 작업 로그

- 목표: feed 원글 PATCH/DELETE와 reply DELETE를 Spring으로 이관한다.
- 범위: Spring chat_service_feed controller/service/repository/dto, web feed routes/client/tests.
- 제외: 답글 수정 신규 기능.

## 결과
- feed 원글 수정/삭제와 답글 삭제를 Spring API로 이관했다.
- Spring service가 본문 길이, 원글 수정 제한, 작성자 권한, 원글 삭제 시 답글 정리를 소유한다.
- Next route는 actor profile 해석 후 Spring client 호출만 담당한다.

## 검증
- `pnpm --filter @yeon/web exec vitest run 'src/app/api/v1/chat-service/feed/[postId]/__tests__/route.test.ts' 'src/app/api/v1/chat-service/feed/[postId]/replies/__tests__/route.test.ts' src/app/api/v1/chat-service/feed/__tests__/route.test.ts` 통과
- `./gradlew test --tests world.yeon.backend.chat_service_feed.controller.ChatServiceFeedControllerTests` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
