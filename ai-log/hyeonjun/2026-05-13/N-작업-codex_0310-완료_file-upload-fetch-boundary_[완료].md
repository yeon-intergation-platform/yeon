# file upload fetch boundary 정리

## 목표

- `use-file-upload.ts`의 직접 `fetch()`를 제거하고 상담 워크스페이스 fetch wrapper로 통일한다.
- FormData 업로드, 임시 레코드, 완료/실패 callback 흐름은 유지한다.

## 진행

- 작업 전 상태 확인 완료.
- 구현 전 백로그 26차 작성 예정.

## 검증

- 예정: web typecheck, web lint, web build, git diff --check, sync-skills, verify-ssot, 직접 fetch grep.

## 완료

- `use-file-upload.ts`의 FormData 업로드 직접 `fetch()`를 `counselingWorkspaceFetchJson`으로 교체했다.
- 임시 레코드 생성, `onUploadComplete`, `onUploadError`, 오디오 길이 읽기 흐름은 유지했다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 성공
- `pnpm --filter @yeon/web lint` 성공
- `pnpm --filter @yeon/web build` 성공
- `git diff --check` 성공
- `bash bin/sync-skills.sh --check` 성공
- `(cd /home/osuma/coding_stuffs/yeon && bash bin/verify-ssot.sh --project-only)` 성공
- `git grep -n '\bfetch(' -- apps/web/src/app/counseling-service/_hooks/use-file-upload.ts` 출력 없음
