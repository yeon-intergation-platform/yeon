# 슬라임 공격 루프/피해 누적 테스트 보강

## 목표
- K(및 J/K 공용 공격) 홀드 입력 시 공격 프레임(10,11,12)이 중단 없이 순환하고, 한 번 공격 시그널로 끝나지 않게 반복 공격을 구성한다.
- 반복 공격마다 `attackSerial`이 증가하고, 적 HP가 누적되어 감소하는 동작을 보장한다.

## 작업 내용
- `slime-game-domain.ts`
  - 공격/이동/대기 액션 정의에 재생 방식 `playback`을 직접 선언하도록 추상화 정리.
  - 점프/공격 프레임 계산에서 하드코딩 의존도를 낮추고 `getSpriteActionFrame`에서 playback 설정을 사용하도록 정리.
- `sprite-action-tool.ts`
  - `SpriteActionDefinition`에 선택적 `playback` 필드 추가 및 기본값은 `loop` 처리.
- `slime-validation-domain.test.ts`
  - 공격 홀드 시 프레임이 10-11-12 루프로 진행되는지 검증 테스트 추가.
  - 공격홀드 반복에서 `attackSerial` 누적과 HP 감소가 기대값대로 누적되는지 검증 보강.
