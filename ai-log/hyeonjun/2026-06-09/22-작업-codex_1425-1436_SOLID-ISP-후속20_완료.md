# SOLID/ISP 후속 20

## 목표

- 300개 SOLID/예외 백로그 항목 129~140을 완료한다.
- 타이핑 서비스와 domain LifeOS의 큰 타입/props를 작은 역할별 타입으로 분리한다.

## 변경

- `CharacterDef`를 identity/sprite/animation/credit 타입 조합으로 분리했다.
- 솔로 연습 패널과 레이스 방 대기/설정/로비 props를 content/state/display/action 단위로 분리했다.
- `useRaceRoom`과 `useTerritoryBattleRoom` 결과 타입을 connection/snapshot/message/lifecycle 단위로 분리했다.
- LifeOS daily/weekly/report 타입을 period/hour/mismatch/score/analysis/generation 단위로 분리했다.
- 기존 export 이름은 조합 타입으로 유지해 호출부 변경 없이 ISP 후보를 줄였다.
- 백로그 항목 129~140을 완료 처리했다.

## 검증

- `CI=true pnpm --filter @yeon/web lint`
- `CI=true pnpm --filter @yeon/web typecheck`
- `CI=true pnpm --filter @yeon/domain typecheck`
- `git diff --check`
- 백로그 300개 유지 및 항목 129~140 완료, ISP 타입 분리 검증 스크립트
