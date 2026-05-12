# counseling merged records hook feature 이동

## 목표

- `use-merged-records`를 counseling-record-workspace feature hook으로 이동한다.
- app `_hooks` 직접 구현을 하나 더 줄인다.

## 범위

- 훅 파일 이동
- index re-export 유지
- record model/adapters 이동은 후속 차수

## 완료 내용

- `use-merged-records`를 `features/counseling-record-workspace/hooks`로 이동했다.
- `use-records`는 feature hook import를 참조하도록 바꿨다.
- `RecordItem` 타입과 record-state adapters 이동은 `use-records` 정리 차수로 남겼다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
