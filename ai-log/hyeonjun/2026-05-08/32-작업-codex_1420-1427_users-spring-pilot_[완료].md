# 32차 작업 — users spring pilot

- 시작: 14:20
- 종료: 14:27
- 상태: 완료

## 목표
- users list/create route와 service를 Spring으로 이동한다.

## 작업내용
- backend `users` package를 추가했다.
- Next `/api/v1/users` route를 Spring thin BFF로 전환했다.
- route cutover 뒤 production consumer가 사라진 `users-service.ts`와 관련 test도 제거했다.

## 검증
- `./gradlew test --tests 'world.yeon.backend.users.*'' ✅
- `pnpm --filter @yeon/web exec vitest run 'src/app/api/v1/users/__tests__/route.test.ts'' ✅
- `pnpm --filter @yeon/web typecheck` ✅
- `pnpm --filter @yeon/web build` ✅
- `git diff --check` ✅
- `bash bin/sync-skills.sh --check` ✅
- `bash bin/verify-ssot.sh --project-only` ✅

## audit
- `apps/web/src/app/api/v1/users/**` 기준 `users-service` / `listUsers` / `createUser` no matches ✅
- `apps/web/src/server/services/users-service.ts` 삭제 완료 ✅
