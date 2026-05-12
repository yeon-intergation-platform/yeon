# counseling workspace UI policy feature lib 이동

## 목표

- 상담 워크스페이스 surface/sidebar/tutorial 정책 판정 로직을 app `_lib`에서 feature lib로 이동한다.
- page route는 feature 정책을 참조만 하도록 정렬한다.

## 변경 대상

- `apps/web/src/features/counseling-record-workspace/lib/counseling-workspace-ui-policy.ts`
- `apps/web/src/features/counseling-record-workspace/lib/__tests__/counseling-workspace-ui-policy.test.ts`
- `apps/web/src/app/counseling-service/_lib/counseling-workspace-ui-policy.ts`
- `apps/web/src/app/counseling-service/page.tsx`
- `docs/product/backlog/frontend-structure-standardization-20260512.md`

## 검증 예정

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`

## 완료

- 상담 워크스페이스 surface/sidebar/tutorial 정책 판정 로직을 feature lib로 이동했다.
- app `_lib/counseling-workspace-ui-policy.ts`는 feature lib re-export만 담당한다.
- `page.tsx` 실제 사용처 import를 feature lib로 정렬했다.
- 정책 단위 테스트를 feature lib 옆으로 이동했다.

## 검증 결과

- `pnpm --filter @yeon/web exec vitest run src/features/counseling-record-workspace/lib/__tests__/counseling-workspace-ui-policy.test.ts` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과

## 참고

- 처음 `pnpm --filter @yeon/web test -- src/features/...` 형태로 실행했을 때 Vitest 전체 테스트가 돌아 기존 unrelated 테스트 실패가 함께 노출되었다.
- 올바른 targeted 명령(`pnpm --filter @yeon/web exec vitest run ...`)으로 이동한 테스트만 별도 검증했다.
