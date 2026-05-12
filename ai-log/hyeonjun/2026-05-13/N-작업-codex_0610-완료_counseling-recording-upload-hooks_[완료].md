# counseling recording/file upload hooks 작업 로그

## 목표

- 녹음/파일 업로드 진입 훅을 app route layer에서 feature layer로 이동한다.
- 오디오 업로드 API 호출을 feature api helper로 분리한다.

## 범위

- `use-file-upload`, `use-recording` 이동
- `uploadCounselingRecordAudio` API helper 추가
- app `_hooks/index.ts` re-export 정리

## 검증 예정

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`

## 완료 내용

- `use-file-upload`, `use-recording`을 `features/counseling-record-workspace/hooks`로 이동했다.
- 오디오 업로드 POST 호출을 `uploadCounselingRecordAudio` helper로 분리했다.
- app `_hooks/index.ts`는 기존 import 호환 re-export만 유지한다.
- `RecordItem` 타입의 feature 이동은 별도 차수로 남겼다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
