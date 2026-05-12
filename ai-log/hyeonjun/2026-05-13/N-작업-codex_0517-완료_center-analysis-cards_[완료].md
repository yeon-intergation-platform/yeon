# center analysis cards 추출 작업 로그

## 목표

- `center-panel.tsx`의 AI 분석 결과 카드 렌더링을 feature component로 추출한다.
- 분석 결과 표시 동작/문구/스타일은 유지한다.

## 범위

- `apps/web/src/app/counseling-service/_components/center-panel.tsx`
- `apps/web/src/features/counseling-record-workspace/components/analysis-cards.tsx`
- `docs/product/backlog/frontend-structure-standardization-20260512.md`

## 진행

- 백로그 51차 작성.

## 완료 내용

- AI 분석 결과 카드 렌더링을 `AnalysisCards` feature component로 추출했다.
- `center-panel.tsx`는 분석 결과 표시 컴포넌트를 import해 조립만 하도록 줄였다.
- 분석 결과 표시 문구, 조건, 스타일은 유지했다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
