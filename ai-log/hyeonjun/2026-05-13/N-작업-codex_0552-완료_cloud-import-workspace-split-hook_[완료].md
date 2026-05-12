# cloud import workspace split hook 추출

## 목표

- `cloud-import-inline.tsx`의 확장 프리뷰 split ratio, viewport, pointer resize 상태를 hook으로 분리한다.
- God component를 기능 흐름/렌더링 조립 중심으로 낮춘다.

## 변경 대상

- `apps/web/src/features/cloud-import/components/cloud-import-inline.tsx`
- `apps/web/src/features/cloud-import/hooks/use-cloud-import-workspace-split.ts`
- `docs/product/backlog/frontend-structure-standardization-20260512.md`

## 검증 예정

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`

## 완료

- 확장 프리뷰 split ratio, viewport media query, localStorage 저장/복원, pointer resize/keyboard nudge 상태를 `useCloudImportWorkspaceSplit` hook으로 분리했다.
- `cloud-import-inline.tsx`는 가져오기 흐름과 렌더링 조립 중심으로 축소했다.
- 컴포넌트 파일 크기를 1266줄에서 866줄로 줄였다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
