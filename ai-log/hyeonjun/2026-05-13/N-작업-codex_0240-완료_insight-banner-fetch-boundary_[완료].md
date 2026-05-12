# insight banner fetch/query key boundary 정리

## 목표

- 상담 인사이트 배너 dismissals hook의 직접 `fetch()`와 raw query key 상수를 정리한다.

## 변경

- 배너 상태 조회/닫기 요청을 `counselingWorkspaceFetchJson`으로 교체.
- query key를 `counselingInsightBannerQueryKeys.dismissals()` factory로 고정.
- Zod schema parse와 cache patch 흐름은 유지.

## 검증

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only` (원본 worktree에서 실행)
- `git grep -n '\\bfetch(' -- apps/web/src/app/counseling-service/_hooks/use-counseling-insight-banner-dismissals.ts` → 없음
- `git grep -n 'queryKey: \\[' -- apps/web/src/app/counseling-service/_hooks/use-counseling-insight-banner-dismissals.ts` → 없음
