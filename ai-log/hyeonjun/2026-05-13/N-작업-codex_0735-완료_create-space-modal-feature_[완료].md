# create space modal component feature 이동

## 목표

- `create-space-modal.tsx` component 소유권을 app에서 feature로 이동한다.
- app sidebar는 feature component를 직접 조립한다.

## 변경

- `app/counseling-service/_components/create-space-modal.tsx` → `features/counseling-record-workspace/components/create-space-modal.tsx`
- `sidebar.tsx` import 갱신

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
