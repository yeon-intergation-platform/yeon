# center partial transcript state component 추출

## 목표

- `center-panel.tsx`의 partial transcript ready 상태 UI를 feature component로 분리한다.
- 누락 구간 retry 동작과 transcript 표시 문구는 유지한다.

## 범위

- `apps/web/src/app/counseling-service/_components/center-panel.tsx`
- `apps/web/src/features/counseling-record-workspace/components/record-partial-transcript-state.tsx`
- `docs/product/backlog/frontend-structure-standardization-20260512.md`

## 진행

- 백로그 56차 작성 완료.

## 완료

- `RecordPartialTranscriptState`를 feature component로 추가했다.
- partial transcript ready 상태의 header, audio player, 누락 구간 retry CTA, feedback, transcript details 표시를 component로 이동했다.
- `center-panel.tsx`는 partial 상태에서 feature component 조립만 수행하도록 축소했다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
