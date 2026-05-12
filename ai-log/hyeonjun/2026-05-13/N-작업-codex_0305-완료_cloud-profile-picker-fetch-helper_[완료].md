# 작업 로그: cloud profile picker file fetch helper 정리

## 목표

- `cloud-profile-picker.tsx`의 직접 `fetch()` 호출을 제거한다.
- Blob 응답을 `studentManagementFetchBlob` helper로 통일한다.

## 검증 계획

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only` (원본 worktree)

## 완료 내용

- `cloud-profile-picker.tsx`의 클라우드 파일 다운로드 직접 `fetch()` 호출을 제거했다.
- `studentManagementFetchBlob` helper를 추가해 Blob 응답도 student-management fetch boundary 안에서 처리한다.
- provider별 URL 조합, File 생성, 오류 표시 흐름은 유지했다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `(cd /home/osuma/coding_stuffs/yeon && bash bin/verify-ssot.sh --project-only)` 통과
- `git grep -n '\bfetch(' -- apps/web/src/features/student-management/components/cloud-profile-picker.tsx` 결과 없음
