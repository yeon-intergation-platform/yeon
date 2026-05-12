# 작업 로그: typing-service query key factory 정리

## 목표

- `use-typing-decks.ts`의 inline queryKey 객체(`{ adminMode }`)와 root raw key를 factory 함수로 흡수한다.
- 캐시 key 구성의 source of truth를 query key helper에 모은다.

## 범위

- `apps/web/src/features/typing-service/use-typing-decks.ts`

## 진행

- 2026-05-13 00:46 KST: 작업 시작.

- 2026-05-13 00:52 KST: `typingDecksRootQueryKey`, `typingDeckDetailRootQueryKey`를 추가하고 admin/user mode를 factory 인자로 흡수. list/detail query와 invalidation에서 factory만 사용하도록 변경.

## 검증

- `rg "\{ adminMode \}|queryKey:\s*\[\.\.\.|invalidateQueries\(\{ queryKey: \[\"typing-decks\"\]" apps/web/src/features/typing-service/use-typing-decks.ts` 결과 없음
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 원본 worktree에서 통과
