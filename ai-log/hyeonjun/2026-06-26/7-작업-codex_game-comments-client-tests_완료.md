# 게임 댓글 Spring client 경계 테스트 보강

- 시작: 2026-06-26 21:30 KST
- 범위: `apps/web/src/server/game-comments-spring-client.ts` 테스트 추가
- 목적: 기능 변경 없이 댓글 Spring BFF 호출 헤더/본문/오류 경계를 고정한다.

## 진행

- 게임 Spring client 보강 후 댓글 client만 전용 테스트가 남아 있음을 확인했다.
- 댓글 client 테스트 작성 중 한글 `displayName`을 `Headers.set`에 직접 넣으면 Fetch ByteString 제한으로 TypeError가 나는 버그를 확인했다.
- 웹 BFF는 댓글 viewer name/avatar 헤더를 percent-encode하고, Spring controller는 service 호출 전에 UTF-8 decode하도록 수정했다.
- 댓글 목록/작성/비밀댓글 확인/삭제 client 호출 계약 테스트를 추가했다.

## 검증

- `pnpm --filter @yeon/web test -- src/server/__tests__/game-comments-spring-client.test.ts`
  - 결과: web 전체 222개 파일 / 973개 테스트 통과
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `cd apps/backend && ./gradlew test`
- `bash bin/verify-ssot.sh --project-only`
- `git diff --check`
