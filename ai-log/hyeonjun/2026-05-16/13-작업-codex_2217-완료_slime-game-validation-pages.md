# 슬라임 게임 검증 페이지 분리 작업 로그

## 목표

- `/slime-game`을 1페이지 액션프레임, 2페이지 충돌, 3페이지 히트박스/전투 판정 검증으로 나눈다.
- 검증 완료 후 실제 게임 제작에 재사용할 수 있도록 입력/프레임/충돌/전투 핵심 로직을 모듈화한다.

## 진행

- 작업 시작 전 상태 확인:
  - 브랜치: `codex/slime-game-validation-pages` (`origin/main` 기준 새 브랜치)
  - 기존 미소유 변경: `.tmp/dev-all/*.log`, `apps/web/public/slime-game/assets/backup.zip`는 이번 작업에서 건드리지 않고 stage 제외한다.
- 백로그: `docs/product/backlog/slime-game-validation-pages-20260516.md`

## 검증 예정

- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web build`
- `/slime-game` 브라우저 검증: 1→2→3 페이지 이동, 액션/충돌/히트박스 핵심 상태 확인

## 변경

- `SlimeGamePrototype`를 3단계 pager shell로 변경했다.
- 1페이지 액션프레임 검증 런타임을 `slime-action-validation-runtime.tsx`로 분리했다.
- 2페이지 충돌 검증을 `slime-collision-domain.ts`, `slime-collision-validation-runtime.tsx`로 추가했다.
- 3페이지 히트박스/피해 판정 검증을 `slime-combat-domain.ts`, `slime-combat-validation-runtime.tsx`로 추가했다.
- 공통 입력 루프를 `use-sprite-validation-runtime.ts`로 분리했다.
- 검 베기 시각 효과를 `slime-sword-attack-effect.tsx`로 분리했다.
- 순수 domain test `slime-validation-domain.test.ts`를 추가했다.

## 검증 결과

- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web build` 통과.
- `pnpm --filter @yeon/web exec vitest run src/features/slime-game/slime-validation-domain.test.ts` 통과: 5 tests.
- 참고: `pnpm --filter @yeon/web test -- slime-validation-domain.test.ts`는 Vitest 필터가 적용되지 않고 전체 suite가 실행되어 기존 Spring mock/header 기대값 테스트들이 실패했다. 동일 파일 단독 검증은 위 `exec vitest run ...`으로 통과 확인.
- `pnpm --filter @yeon/web exec next start -p 3117` 후 Playwright 검증 통과:
  - 1페이지 제목 `1페이지 · 액션프레임 검증` 확인.
  - 공격 버튼 후 `공격 (attack)`, 검 이펙트/블레이드 각 1개 확인.
  - 다음 버튼으로 2페이지 `지형 충돌 검증` 이동 확인.
  - 점프 충돌 테스트 후 grounded `true -> false` 확인.
  - 다음 버튼으로 3페이지 `히트박스 검증` 이동 확인.
  - 공격 후 enemy HP `100/100 -> 75/100`, 결과 `HIT: 25 피해` 확인.
  - 이전 버튼으로 2페이지 복귀 확인.
