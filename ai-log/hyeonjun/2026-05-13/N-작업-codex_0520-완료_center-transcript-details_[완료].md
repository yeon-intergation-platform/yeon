# center transcript details 추출 작업 로그

## 목표

- `center-panel.tsx`의 전사 원문 details 렌더링을 feature component로 추출한다.
- 부분 원문/완료 원문의 빈 상태와 open 동작은 유지한다.

## 범위

- `apps/web/src/app/counseling-service/_components/center-panel.tsx`
- `apps/web/src/features/counseling-record-workspace/components/transcript-details.tsx`
- `docs/product/backlog/frontend-structure-standardization-20260512.md`

## 진행

- 백로그 52차 작성.

## 완료 내용

- 반복되던 전사 원문 details 렌더링을 `TranscriptDetails` feature component로 추출했다.
- 전사 summary 계산과 segment row 표시 책임을 feature component로 이동했다.
- 부분 원문/완료 원문의 빈 상태 문구와 기본 open 동작은 유지했다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
