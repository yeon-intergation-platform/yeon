# SOLID/예외 300 백로그 후속 60

- 항목: 215
- 대상: `apps/web/src/features/card-service/card-room-study-panel.tsx`
- 원칙: SRP(S)
- 변경:
  - 결과 요약 계산을 `getCardRoomResultSummary`로 분리.
  - 대기/종료/완료/pending 상태 패널을 작은 컴포넌트로 분리.
  - 현재 카드 표시와 결과/다음 액션 렌더링을 `CardRoomCurrentCardPanel`로 분리.
  - `CardRoomStudyPanel`은 상태별 패널 조립만 담당하도록 축소.
- 검증 예정:
  - `CI=true pnpm --filter @yeon/web lint`
  - `CI=true pnpm --filter @yeon/web typecheck`
  - `git diff --check`
