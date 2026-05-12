# center audio player component 추출

## 목표

- `center-panel.tsx`에 남은 오디오 플레이어 중복 JSX를 feature component로 분리한다.
- 재생/seek 상태의 source of truth는 상위에 유지한다.

## 범위

- `apps/web/src/app/counseling-service/_components/center-panel.tsx`
- `apps/web/src/features/counseling-record-workspace/components/record-audio-player.tsx`
- `docs/product/backlog/frontend-structure-standardization-20260512.md`

## 진행

- 백로그 53차 작성 완료.

## 완료

- `RecordAudioPlayer`를 feature component로 추가했다.
- partial transcript/ready 상태의 오디오 플레이어 JSX와 seek 비율 계산을 공용 component로 이동했다.
- 텍스트 메모 fallback 문구는 ready 상태에서만 기존처럼 표시되도록 유지했다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
