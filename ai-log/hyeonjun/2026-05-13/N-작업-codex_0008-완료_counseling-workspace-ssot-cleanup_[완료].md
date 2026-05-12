# 상담 워크스페이스 SSOT 정리 작업 로그

## 목표

- 실제 사용 경로인 `apps/web/src/app/counseling-service/**`를 상담 워크스페이스 SSOT로 둔다.
- `features/counseling-record-workspace/**`에 남은 별도 워크스페이스 구현을 제거해 이중 구현 위험을 없앤다.
- 실제 사용 중인 오디오 길이 판독 유틸은 공용 audio lib로 흡수한다.

## 작업 범위

- `apps/web/src/app/legacy-counseling-records/page.tsx`
- `apps/web/src/app/counseling-service/_hooks/use-file-upload.ts`
- `apps/web/src/lib/audio-file.ts`
- `apps/web/src/features/counseling-record-workspace/**`

## 검증 결과

- `rg 'counseling-record-workspace' apps/web/src` 통과: 제거된 feature 경로 참조 없음.
- `rg 'readAudioDurationMs' apps/web/src` 통과: 공용 `audio-file.ts`와 실제 업로드 훅만 참조.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web build` 통과.
- `git diff --check` 통과.
- `bash bin/sync-skills.sh --check` 통과.
- `bash bin/verify-ssot.sh --project-only` 통과. worktree `.git` 파일 제약 때문에 프로젝트 SSOT 검사는 원본 worktree에서 확인했다.

## 진행 상태

- 완료.
