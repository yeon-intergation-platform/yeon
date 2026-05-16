# 슬라임 게임 입력/충돌 보정 작업 로그

## 목표

- `/slime-game` 검증 모듈의 조작 반응을 실사용 감각에 맞게 보정한다.
- 2단 점프, 누른 상태 점프 연속, 누른 상태 공격 연속, 좌우 반대키 동시 입력 시 즉시 방향 전환을 반영한다.
- 지형 충돌 판정용 슬라임 충돌박스 크기를 조금 축소해 판정 여유를 줄인다.

## 작업 전 점검

- 현재 브랜치: `codex/slime-game-validation-pages` (`origin/main` 기준)
- 기존 미소유 변경: `.tmp/dev-all/*.log`, `apps/web/public/slime-game/assets/backup.zip` 제외
- 작업 로그/백로그: 이전 작업 로그 `13-작업-codex_2217-완료_slime-game-validation-pages.md`, `docs/product/backlog/slime-game-validation-pages-20260516.md`

## 변경 사항

- `slime-game-state.ts`
  - 점프 입력을 `isControlHeld` 기반으로 바꿔 장시간 점유 시 반복 점프 시나리오를 처리.
  - 2단 점프 카운터(`jumpsUsed`)를 추가하고, 공중 2단 점프(낙하 구간 진입 후) 허용.
  - 좌/우 동시 입력 시 한쪽 신규 입력 기준으로 direction/facing 전환 로직 추가.

- `slime-collision-domain.ts`
  - 충돌 테스트용 슬라임 body 크기 축소(`playerWidth: 72 -> 68`, `playerHeight: 76 -> 72`).
  - 점프 카운터(`jumpsUsed`) 추가, held 기반 jump 판정으로 반응 개선.
  - 2단 점프 조건(공중 낙하 상태) 및 좌/우 동시 입력 전환 규칙 반영.
  - 바닥 접촉 시 `jumpsUsed` 초기화.

- `slime-combat-domain.ts`
  - 공격 입력을 held 기반으로 변경해 J 키/공격 버튼 유지 시 공격 액션 지속.
  - 공격이 종료 지점에서 held가 유지될 때 즉시 다음 공격 루프가 이어지도록 타이밍 보정.
  - 좌/우 동시 입력 전환 로직 공유.

- `slime-validation-domain.test.ts`
  - 점프/공격 held 동작, 2단 점프 체인, 좌/우 동시 입력 반전, 액션 지속 공격 등에 대한 단위 테스트를 추가.

## 검증 예정

- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web exec vitest run src/features/slime-game/slime-validation-domain.test.ts`

## 검증 결과

- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web exec vitest run src/features/slime-game/slime-validation-domain.test.ts`
  - 총 8개 테스트 통과
