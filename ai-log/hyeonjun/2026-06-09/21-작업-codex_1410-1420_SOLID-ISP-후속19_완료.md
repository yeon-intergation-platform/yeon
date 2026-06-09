# SOLID/ISP 후속 19

## 목표

- 300개 SOLID/예외 백로그 항목 119~128을 완료한다.
- 큰 타입/props/interface를 더 작은 상태·액션·표시 단위 타입으로 분리한다.

## 변경

- race-server `RoomParticipant`를 identity/progress/result/session/auth 상태 타입 조합으로 분리했다.
- 카드방 헤더/학습 패널 props를 정체성·상태·권한·액션 타입으로 분리했다.
- 카드 에디터 toolbar/editor/preview props와 state를 표시·상태·액션 단위 타입으로 분리했다.
- 카드 행 편집/조회/복습 카드 props를 content/status/action 단위 타입 조합으로 정리했다.
- 백로그 항목 119~128을 완료 처리했다.

## 검증

- `CI=true pnpm --filter @yeon/web lint`
- `CI=true pnpm --filter @yeon/web typecheck`
- `CI=true pnpm --filter @yeon/race-server build`
- `git diff --check`
- 백로그 300개 유지 및 항목 119~128 완료, ISP 타입 분리 검증 스크립트
