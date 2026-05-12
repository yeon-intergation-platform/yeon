# cloud import saved drafts modal component 추출

## 목표

- `cloud-import-inline.tsx`의 저장된 가져오기 작업 모달 JSX를 별도 component로 분리한다.
- God component의 presentation 책임을 더 줄인다.

## 변경 대상

- `apps/web/src/features/cloud-import/components/cloud-import-inline.tsx`
- `apps/web/src/features/cloud-import/components/cloud-import-saved-drafts-modal.tsx`
- `docs/product/backlog/frontend-structure-standardization-20260512.md`

## 검증 예정

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`

## 완료

- 저장된 가져오기 작업 모달 UI를 `CloudImportSavedDraftsModal` component로 추출했다.
- `cloud-import-inline.tsx`는 modal 상태 hook 결과를 component에 전달만 한다.
- `cloud-import-inline.tsx` 파일 크기를 872줄에서 719줄로 줄였다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
