# cloud-import-inline 컴포넌트 분리 작업 로그

## 목표

- `cloud-import-inline.tsx`의 파일 그리드, 임시초안 표시 helper, split layout 상수를 분리한다.
- 동작 변경 없이 대형 컴포넌트의 책임을 workspace orchestration 중심으로 줄인다.
- 후속 PR에서 업로드/드래그 상태와 saved draft modal을 추가 분해할 수 있게 경계를 만든다.

## 작업 범위

- `apps/web/src/features/cloud-import/components/cloud-import-inline.tsx`
- `apps/web/src/features/cloud-import/components/cloud-import-file-grid.tsx`
- `apps/web/src/features/cloud-import/cloud-import-draft-display.ts`
- `apps/web/src/features/cloud-import/cloud-import-layout-constants.ts`

## 검증 결과

- `wc -l apps/web/src/features/cloud-import/components/cloud-import-inline.tsx` 확인: 1714줄에서 1399줄로 감소.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web build` 통과.
- `git diff --check` 통과.
- `bash bin/sync-skills.sh --check` 통과.
- `bash bin/verify-ssot.sh --project-only` 통과. worktree `.git` 파일 제약 때문에 프로젝트 SSOT 검사는 원본 worktree에서 확인했다.

## 진행 상태

- 완료.
