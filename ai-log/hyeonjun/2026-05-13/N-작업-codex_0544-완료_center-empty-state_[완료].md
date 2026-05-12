# center empty state component 추출

## 목표

- `center-panel.tsx`의 selected 없음 상태 UI를 feature component로 분리한다.
- center panel을 상태별 feature component 라우터에 가깝게 만든다.

## 범위

- `apps/web/src/app/counseling-service/_components/center-panel.tsx`
- `apps/web/src/features/counseling-record-workspace/components/record-empty-state.tsx`
- `docs/product/backlog/frontend-structure-standardization-20260512.md`

## 진행

- 백로그 58차 작성 완료.

## 완료

- `RecordEmptyState`를 feature component로 추가했다.
- `center-panel.tsx`의 selected 없음 상태 직접 JSX를 feature component 호출로 대체했다.
- `center-panel.tsx`는 empty/error/partial/processing/ready 상태별 feature component를 선택하는 구조가 되었다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
