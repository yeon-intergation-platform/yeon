- 시간: 23:38 ~ 23:40
- 목표: 슬라임 공격 반복 속도 조절(공격 쿨타임) 구현

차수 1
- 작업내용: `resolveSlimeAttackTransition`에 `attackCooldownRemaining`을 추가해 공속 중복 시작 차단, 시작 시 `SLIME_ATTACK_COOLDOWN_TICKS` 설정 로직 추가
- 논의 필요: 없음
- 선택지: 즉시 반복 시작(기존) / 재시작 대기시간 추가
- 추천: 대기시간(쿨타임) 추가
- 사용자 방향: 대기시간 기반 반복 재개

차수 2
- 작업내용: `GameState`/`CombatState`에 `attackCooldown` 상태 추가 및 공용 도메인 상태 갱신 경로 반영
- 논의 필요: 없음
- 선택지: 타이밍은 공격 중 유지/감소 방식 중 택일
- 추천: 공격 종료 후 쿨타임 감소
- 사용자 방향: 공격 종료 후 쿨타임 감소

차수 3
- 작업내용: 연속 공격 유닛 테스트(액션 전이 + 도메인 시뮬레이션) 갱신
- 논의 필요: 없음
- 선택지: 테스트 유지/간소화
- 추천: 새 쿨타임 동작 기준으로 테스트 확장
- 사용자 방향: 테스트 확장

검증:
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web exec vitest run src/features/slime-game/slime-validation-domain.test.ts`
