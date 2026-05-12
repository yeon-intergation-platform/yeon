# space template preview fetch boundary 정리

## 목표

- `space-template-preview-modal.tsx`의 직접 `fetch()`를 제거한다.
- 기존 `space-settings-api.ts` wrapper를 사용해 템플릿 상세 조회를 수행한다.

## 검증

- 예정: web typecheck, web lint, web build, git diff --check, sync-skills, verify-ssot, 직접 fetch grep.

## 완료

- `space-template-preview-modal.tsx`의 직접 `fetch()`를 제거했다.
- 템플릿 상세 조회를 `space-settings-api.ts`의 `fetchSpaceTemplateDetail` wrapper로 이동했다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 성공
- `pnpm --filter @yeon/web lint` 성공
- `pnpm --filter @yeon/web build` 성공
- `git diff --check` 성공
- `bash bin/sync-skills.sh --check` 성공
- `(cd /home/osuma/coding_stuffs/yeon && bash bin/verify-ssot.sh --project-only)` 성공
- `grep -RIn '\bfetch(' apps/web/src/features/space-settings/components/space-template-preview-modal.tsx` 출력 없음
