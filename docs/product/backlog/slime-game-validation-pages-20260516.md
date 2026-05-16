# 슬라임 게임 검증 페이지 분리 백로그 (2026-05-16)

## 1차

### 작업내용

- `/slime-game`을 단일 액션 검증 화면에서 3단계 검증 페이지로 분리한다.
- 1페이지는 기존 슬라임 액션프레임 검증을 유지한다.
- 2페이지는 지형/플랫폼 충돌 검증을 추가한다.
- 3페이지는 공격 히트박스와 몬스터 허트박스/피해 판정 검증을 추가한다.
- 각 페이지를 이전/다음 버튼과 단계 버튼으로 넘길 수 있게 한다.
- 검증이 끝난 뒤 실제 게임 제작에 재사용할 수 있도록 입력, 프레임, 충돌, 전투 판정의 핵심 로직은 React 화면에 묶지 않고 순수 모듈로 분리한다.

### 논의 필요

- 이번 차수는 검증 페이지와 재사용 모듈 기반을 만드는 것이 목표다.
- 실제 완성 게임 루프, 저장, 퀘스트, 보상, 서버 동기화는 아직 만들지 않는다.
- 2페이지 충돌은 AABB 기반 바닥/벽/발판/천장 접촉 검증으로 제한한다.
- 3페이지 전투는 단일 초록 슬라임 몬스터 기준의 active frame hitbox 검증으로 제한한다.

### 선택지

- A. 기존 `/slime-game` 안에서 3단계 pager를 만들고, 각 검증 런타임과 순수 도메인 모듈을 `features/slime-game` 내부에 둔다.
- B. `/slime-game/1`, `/slime-game/2`, `/slime-game/3` 라우트를 새로 만들고 각각 별도 페이지로 나눈다.
- C. 기존 화면에 섹션만 세로로 추가하고 페이지 넘김은 만들지 않는다.

### 추천

- A. 현재 검증 흐름은 하나의 실험실 화면이므로 route는 유지하고 내부 pager로 단계 이동을 제공하는 편이 빠르고, 모듈은 실제 게임 전환 시 feature 내부에서 쉽게 승격할 수 있다.

### 사용자 방향

- 추천안 A 기준으로 진행한다. 1페이지는 기존 액션프레임 검증, 2페이지는 충돌, 3페이지는 히트박스/전투 판정 검증으로 나눈다.

### 완료 기준

- [x] `/slime-game`에서 1/2/3페이지를 버튼으로 이동할 수 있다.
- [x] 1페이지는 기존 idle/walk/jump/attack action frame 검증이 계속 동작한다.
- [x] 2페이지는 좌우 이동/점프 중 바닥, 벽, 발판, 천장 충돌 상태를 화면에서 확인할 수 있다.
- [x] 3페이지는 J 공격의 active frame hitbox와 초록 슬라임 hurtbox 충돌, HP 감소, 중복 타격 방지를 확인할 수 있다.
- [x] 입력/프레임/충돌/전투 판정 로직이 화면 JSX 안에 흩어지지 않고 재사용 가능한 모듈로 분리된다.
- [x] `pnpm --filter @yeon/web lint`, `pnpm --filter @yeon/web typecheck`, `pnpm --filter @yeon/web build`를 통과한다.
- [x] 브라우저 검증으로 1→2→3 페이지 이동과 각 페이지 핵심 상태 전이를 확인한다.

## 완료 기록

- `/slime-game`에 1/2/3단계 pager를 추가했다.
- 1페이지는 기존 액션프레임 검증 런타임을 `SlimeActionValidationRuntime`으로 분리해 유지했다.
- 2페이지는 `slime-collision-domain.ts` AABB 순수 모듈 기반으로 바닥/벽/발판/천장 충돌을 검증한다.
- 3페이지는 `slime-combat-domain.ts` 순수 모듈 기반으로 attack active frame hitbox, enemy hurtbox, HP 감소, 같은 attackSerial 중복 타격 방지를 검증한다.
- 공통 입력/one-shot 처리 루프를 `use-sprite-validation-runtime.ts`로 분리했다.
- 검 본체/칼끝 호 합성은 `slime-sword-attack-effect.tsx`로 분리했다.
- 검증: lint, typecheck, build, 순수 도메인 vitest, `next start -p 3116` + Playwright 브라우저 검증 통과.
