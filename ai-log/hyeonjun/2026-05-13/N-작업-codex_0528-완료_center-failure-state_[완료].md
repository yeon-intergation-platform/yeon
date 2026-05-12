# center failure state component 추출

## 목표

- `center-panel.tsx` 실패 상태 UI와 실패 표시 판정 로직을 feature layer로 이동한다.
- retry 동작과 메시지는 기존과 동일하게 유지한다.

## 범위

- `apps/web/src/app/counseling-service/_components/center-panel.tsx`
- `apps/web/src/app/counseling-service/_lib/failure-presentation.ts`
- `apps/web/src/features/counseling-record-workspace/components/record-failure-state.tsx`
- `apps/web/src/features/counseling-record-workspace/lib/record-failure-presentation.ts`
- `docs/product/backlog/frontend-structure-standardization-20260512.md`

## 진행

- 백로그 54차 작성 완료.

## 완료

- `RecordFailureState`를 feature component로 추가했다.
- 실패 표시 판정 로직을 `features/counseling-record-workspace/lib/record-failure-presentation.ts`로 이동했다.
- 기존 app `_lib/failure-presentation.ts`는 테스트/호환 import를 위해 re-export로 유지했다.
- `center-panel.tsx`의 실패 상태 JSX와 retry 분기 UI를 feature component 호출로 축소했다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --dir apps/web exec vitest run src/app/counseling-service/_lib/__tests__/failure-presentation.test.ts` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과

## 참고

- `pnpm --filter @yeon/web test -- src/app/counseling-service/_lib/__tests__/failure-presentation.test.ts`는 Vitest 파일 필터가 적용되지 않아 전체 suite가 실행되며 기존 unrelated 실패가 노출되어 실패했다. 이후 `pnpm --dir apps/web exec vitest run <file>`로 targeted 검증을 통과했다.
