# chat-service 공용 인증 조회 Spring 이관

## 목표

- `apps/web/src/app/api/v1/chat-service/_shared.ts`에서 DB 기반 `getChatServiceAuthByToken` 직접 호출을 제거한다.
- Next는 세션 토큰 추출만 담당하고 Spring auth session 응답으로 profile을 resolve한다.

## 완료 근거

- `_shared.ts`의 `getChatServiceAuthByToken` 직접 호출 제거.
- Spring `fetchChatServiceSessionFromSpring` 응답을 `chatServiceSessionResponseSchema`로 검증해 공용 auth profile을 구성.
- 검증 통과:
  - `pnpm --filter @yeon/web typecheck`
  - `pnpm --filter @yeon/web exec vitest run src/app/api/v1/chat-service/auth/session/__tests__/route.test.ts src/app/api/v1/chat-service/feed/__tests__/route.test.ts`
  - `pnpm --filter @yeon/web build`
  - `git diff --check`
  - `bash bin/sync-skills.sh --check`
  - `bash bin/verify-ssot.sh --project-only`
