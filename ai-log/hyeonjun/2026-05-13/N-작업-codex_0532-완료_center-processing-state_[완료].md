# center processing state component 추출

## 목표

- `center-panel.tsx`의 일반 processing 상태 UI를 feature component로 분리한다.
- checklist 계산과 표시 규칙은 기존과 동일하게 유지한다.

## 범위

- `apps/web/src/app/counseling-service/_components/center-panel.tsx`
- `apps/web/src/features/counseling-record-workspace/components/record-processing-state.tsx`
- `docs/product/backlog/frontend-structure-standardization-20260512.md`

## 진행

- 백로그 55차 작성 완료.

## 완료

- `RecordProcessingState`를 feature component로 추가했다.
- 일반 processing 상태의 header/body/checklist JSX와 checklist step 계산을 feature component로 이동했다.
- partial transcript ready 상태는 retry/action UI가 결합되어 있어 후속 차수로 남겼다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
