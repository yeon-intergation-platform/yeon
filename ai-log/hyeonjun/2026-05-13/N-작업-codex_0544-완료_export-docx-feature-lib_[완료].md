# export-docx feature lib 이동

## 목표

- 상담 워크스페이스 app `_lib`에 남아 있던 DOCX 내보내기 기능 로직을 feature lib로 이동한다.
- app route/component는 feature export를 직접 사용하고, app `_lib`는 호환 re-export만 남긴다.

## 변경 대상

- `apps/web/src/features/counseling-record-workspace/lib/export-docx.ts`
- `apps/web/src/app/counseling-service/_lib/export-docx.ts`
- `apps/web/src/app/counseling-service/page.tsx`
- `apps/web/src/app/counseling-service/_components/member-panel.tsx`
- `docs/product/backlog/frontend-structure-standardization-20260512.md`

## 검증 예정

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`

## 완료

- DOCX 생성/다운로드 구현을 `features/counseling-record-workspace/lib/export-docx.ts`로 이동했다.
- app `_lib/export-docx.ts`는 feature lib re-export만 담당한다.
- `page.tsx`, `member-panel.tsx` 실제 사용처 import를 feature lib로 정렬했다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
