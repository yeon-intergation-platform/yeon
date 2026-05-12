# Community chat React Query boundary 정리

## 작업

- community chat messages/presence query key factory를 추가했다.
- `useCommunityChat`의 수동 polling state를 TanStack Query `useQuery`/`useMutation`으로 전환했다.
- 메시지 전송 성공 시 chat messages query를 invalidate하도록 명시했다.

## 검증 예정

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`
