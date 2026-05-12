# counseling record model/lib feature 원천화

## 목표

- feature hook들이 app `_lib`에 의존하지 않도록 상담 기록 model/lib 원천을 feature로 이동한다.
- app `_lib`는 compatibility wrapper만 유지한다.

## 범위

- types/utils/processing-progress/record-state-adapters/client-request-id 이동
- feature import 경로 변경
- app component 대규모 import 변경은 후속 차수

## 완료 내용

- `types`, `utils`, `processing-progress`, `record-state-adapters`, `client-request-id` 원천을 `features/counseling-record-workspace/lib`로 이동했다.
- 기존 app `_lib` 파일은 compatibility re-export wrapper로 바꿨다.
- feature 내부의 app `_lib` 직접 import를 제거했다.

## 검증 결과

- `pnpm --filter @yeon/web exec vitest run src/app/counseling-service/_hooks/__tests__/use-records.test.ts src/app/counseling-service/_hooks/__tests__/use-record-retry.test.ts` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
