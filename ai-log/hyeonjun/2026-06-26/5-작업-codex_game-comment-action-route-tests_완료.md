# 게임 댓글 액션 BFF 경계 테스트 보강

- 시작: 2026-06-26 21:23 KST
- 범위: `apps/web/src/app/api/v1/game-service/comments/[id]` 하위 route 테스트 추가
- 목적: 기능 변경 없이 댓글 좋아요, 비밀댓글 확인, 삭제 API의 입력/인증/오류 경계를 고정한다.

## 진행

- 댓글 액션 route 3종(`like`, `reveal`, `DELETE`)에 테스트 공백이 있음을 확인했다.
- 댓글 좋아요, 비밀댓글 확인, 댓글 삭제 route의 인증/입력 검증/업무 오류 매핑 테스트를 추가했다.

## 검증

- `pnpm --filter @yeon/web test -- 'src/app/api/v1/game-service/comments/[id]/like/__tests__/route.test.ts' 'src/app/api/v1/game-service/comments/[id]/reveal/__tests__/route.test.ts' 'src/app/api/v1/game-service/comments/[id]/__tests__/route.test.ts'`
  - 결과: web 전체 218개 파일 / 961개 테스트 통과
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `bash bin/verify-ssot.sh --project-only`
- `git diff --check`
