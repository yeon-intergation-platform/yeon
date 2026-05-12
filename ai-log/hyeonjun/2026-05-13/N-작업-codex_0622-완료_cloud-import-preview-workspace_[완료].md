# cloud import preview workspace component 추출

## 목표

- `cloud-import-inline.tsx`의 로컬/클라우드 preview workspace 중복 UI를 별도 component로 추출한다.
- cloud import 동작/API/상태 훅은 변경하지 않는다.

## 검증 계획

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`

## 완료 내용

- `CloudImportPreviewWorkspace`를 추가해 로컬/클라우드 preview pane, split separator, right panel 배치를 공용화했다.
- `CloudImportFileBrowser`를 추가해 provider tab, OAuth 상태, breadcrumb, view mode toggle, file grid UI를 분리했다.
- `cloud-import-inline.tsx`는 import hook 조립, drag/drop, workspace mode 전환만 담당하도록 축소했다.
- 라인 수: `cloud-import-inline.tsx` 647줄 → 251줄.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
