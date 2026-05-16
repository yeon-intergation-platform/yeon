# 작업 로그: 슬라임 게임 추상화 차수 점검(과다 추상화 억제)

- 작업 시작: 17:10
- 작업 종료: 17:35
- 작업 대상: `apps/web/src/features/slime-game/*`

## 목표
- `slime-game` 공통 규칙을 과도하게 추상화하지 않으면서
  핵심 반복 로직만 도메인 계층으로 통합.
- 사용자 요청 기준(동시 좌우 이동 전환/공격 홀드 반복/2단 점프/프레임 루프/검 이펙트 반복) 유지.

## 수행 내역(차수 중심)
1) 입력·이동/방향 규칙 통합
- `resolveSlimeMoveDirectionAndFacing`로 공용화.

2) 공격 상태 전이 통합
- `resolveSlimeAttackTransition`로 공격 시작/계속/재시작 정책 통일.

3) 점프 조건 정책 통합(과도 추상화 최소화)
- `canStartSlimeJump` 헬퍼로 공통 조건을 상수화하고,
  좌/우 모드의 낙하 시점 부호 차이는 `canStartCondition`으로 최소 분기 처리.

4) 테스트 확대
- 공격 홀드 상태/프레임 루프/방향 전환/공격 시리얼/판정 경계 케이스를 `slime-validation-domain.test.ts`로 보강.

## 검증
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web exec vitest run src/features/slime-game/slime-validation-domain.test.ts`

