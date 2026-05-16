# 작업 로그: 슬라임 검 이펙트 반복 버그 수정

- 작업 시작: 15:40
- 작업 종료: 15:52
- 변경 대상: `apps/web/src/features/slime-game/slime-game-stage.tsx`
- 변경 내용: 공격 액션 반복 시 `actionTick`을 공격 duration 기준으로 모듈러해 칼 이펙트 `progress`를 매 싸이클마다 0~1로 재산정해 슬라임 반복 시 검 이펙트도 매번 재생되도록 수정
- 검증: `pnpm --filter @yeon/web lint`, `pnpm --filter @yeon/web typecheck`
