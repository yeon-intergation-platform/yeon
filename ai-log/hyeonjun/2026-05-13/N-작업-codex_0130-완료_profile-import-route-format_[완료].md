# profile-import route handler 포맷 복구 작업 로그

## 목표

- 압축된 한 줄 route handler를 formatter 기준으로 복구해 리뷰/디버깅 가능성을 높인다.

## 범위

- 대상: `apps/web/src/app/api/v1/spaces/[spaceId]/members/[memberId]/profile-import/route.ts`
- 비범위: API 동작 변경, OpenAI 호출 정책 변경, Spring 이전

## 검증 예정

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`

## 완료 내용

- `profile-import/route.ts`의 한 줄 압축 코드를 formatter 기준으로 복구했다.
- 지원 파일 타입 상수를 분리하고 파일 타입 판정 helper를 추가해 POST handler의 읽기 흐름을 정리했다.
- AI 호출과 응답 동작은 변경하지 않았다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과 (원본 worktree에서 실행)
- `awk 'length($0)>180 ... profile-import/route.ts'` 결과 0건
