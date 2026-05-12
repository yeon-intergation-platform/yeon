# Typing deck query key SSOT 통합

## 작업

- typing deck 목록/상세 query key factory를 `typing-service-query-keys.ts`의 `typingServiceQueryKeys`로 흡수했다.
- 기존 `use-typing-decks.ts` export 이름은 compatibility alias로 유지했다.
- key shape과 invalidation 범위는 변경하지 않았다.

## 검증 예정

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`
