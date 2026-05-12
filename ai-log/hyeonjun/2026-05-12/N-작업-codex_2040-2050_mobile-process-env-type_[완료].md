# mobile process env 타입 보정 작업 로그

## 목표

- repo-wide pre-commit `pnpm typecheck`를 막던 `@yeon/mobile`의 `process` 타입 오류를 해결한다.

## 시작 상태

- 원본 작업트리에는 unrelated 변경이 있어 `../yeon-mobile-process-type` worktree에서 `codex/mobile-process-type-20260512` 브랜치로 격리했다.
- `apps/mobile/src/services/api-base-url.ts`가 Expo 공개 env를 `process.env`로 읽지만 모바일 tsconfig에 Node process 타입이 없다.

## 진행

- 백로그 작성 후 모바일 내부 ambient type 보정으로 진행한다.

## 완료

- `apps/mobile/src/types/expo-process-env.d.ts`를 추가해 Expo 모바일 앱에서 사용하는 `process.env.NODE_ENV`, `process.env.EXPO_PUBLIC_API_BASE_URL` 타입을 최소 범위로 선언했다.
- Node 타입 전체를 모바일 앱에 추가하지 않아 Expo/React Native 런타임 경계를 유지했다.

## 검증

- `pnpm --filter @yeon/mobile typecheck`
- `pnpm typecheck`
- `pnpm --filter @yeon/mobile lint`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`
