# counseling records data hook feature 이동

## 목표

- `use-records` 구현을 counseling-record-workspace feature hook으로 이동한다.
- app `_hooks`는 route compatibility re-export만 남긴다.

## 범위

- 훅 파일 이동
- index/test import 경로 변경
- app `_lib` model/adapters 이동은 후속 차수

## 완료 내용

- `use-records`를 `features/counseling-record-workspace/hooks`로 이동했다.
- app `_hooks/index.ts`는 기존 import 호환 re-export만 유지한다.
- `use-records` 테스트는 feature hook import를 검증하도록 바꿨다.
- `RecordItem`, `AiMessage`, `processing-progress`, `record-state-adapters` 이동은 별도 model/lib 차수로 남겼다.

## 검증 결과

- `pnpm --filter @yeon/web exec vitest run src/app/counseling-service/_hooks/__tests__/use-records.test.ts` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
