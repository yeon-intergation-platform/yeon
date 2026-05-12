# counseling record retry hook 작업 로그

## 목표

- 재시도 hook을 feature layer로 이동한다.
- 재시도 API 호출을 feature api helper로 고정한다.

## 범위

- `use-record-retry` 이동
- `retryCounselingRecordTranscription`, `retryCounselingRecordAnalysis` helper 추가
- app `_hooks/index.ts`, 테스트 import 정리

## 검증 예정

- `pnpm --filter @yeon/web exec vitest run src/app/counseling-service/_hooks/__tests__/use-record-retry.test.ts`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`

## 완료 내용

- `use-record-retry`를 `features/counseling-record-workspace/hooks`로 이동했다.
- 전사/분석 재시도 API 호출을 `retryCounselingRecordTranscription`, `retryCounselingRecordAnalysis` helper로 분리했다.
- app `_hooks/index.ts`는 기존 import 호환 re-export만 유지한다.
- `RecordItem` 타입의 feature 이동은 별도 차수로 남겼다.

## 검증 결과

- `pnpm --filter @yeon/web exec vitest run src/app/counseling-service/_hooks/__tests__/use-record-retry.test.ts` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
