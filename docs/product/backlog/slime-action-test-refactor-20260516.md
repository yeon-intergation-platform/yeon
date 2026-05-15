# 슬라임 점프·공격 스프라이트 테스트 리팩토링 백로그 (2026-05-16)

## 1차

### 작업내용

- `/slime-game`을 이동 전용 검증에서 이동·점프·공격 sprite action 검증 화면으로 확장한다.
- idle, walk, jump, attack의 frame mapping과 키 바인딩을 슬라임 도메인 정의로 분리한다.
- 입력/프레임 재생/스프라이트 sheet 계산은 `sprite-action-tool.ts` 공용 툴로 분리한다.
- A/D 또는 ←/→는 좌우 이동, Space는 jump, J는 attack 테스트로 처리한다.
- 점프와 공격은 몬스터/체력/히트박스 없이 sprite action만 검증한다.
- 유지보수를 위해 raw 문자열·프레임 숫자·키 코드가 컴포넌트 곳곳에 흩어지지 않게 정리한다.

### 논의 필요

- 이번 차수는 sprite action 검증이 목표이므로 게임 전투/충돌/데미지 도메인은 아직 만들지 않는다.
- 점프는 물리 판정 전체가 아니라 sprite jump frame과 수직 이동 테스트로 제한한다.
- 공격은 hitbox/monster 연결이 아니라 attack frame 재생 테스트로 제한한다.
- 공용화 범위는 현재 `/slime-game` feature 내부의 sprite action test runtime으로 제한한다. 앱 전역 패키지 승격은 두 번째 사용처가 생길 때 결정한다.

### 선택지

- A. `sprite-action-tool.ts`에 공통 입력/프레임 재생 툴을 두고, `slime-game-domain.ts`가 슬라임 고유 action/frame/control을 얹는다.
- B. `slime-game-domain.ts`에 모든 유틸까지 같이 넣고 state/stage/prototype이 이를 참조한다.
- C. 기존 state/stage 파일에 jump/attack 분기를 직접 추가한다.

### 추천

- A. 공용 툴과 슬라임 도메인의 책임이 분리되어 이후 다른 sprite 검증 화면에도 입력/프레임 재생 방식을 재사용할 수 있다.

### 사용자 방향

- A 기준으로 진행. 이동·점프·공격 테스트와 공통화/도메인 정합성/유지보수 리팩토링을 함께 처리한다.

### 완료 기준

- [x] idle은 0번 프레임 하나만 사용한다.
- [x] 좌우 이동은 A/D 또는 ←/→로 확인하고 이동 속도를 기존보다 빠르게 둔다.
- [x] Space/버튼으로 jump action과 #7/#8 프레임, 수직 이동을 확인한다.
- [x] J/버튼으로 attack action과 #10/#11/#12 프레임을 확인한다.
- [x] 몬스터, 체력, 히트박스, 데미지 판정은 추가하지 않는다.
- [x] 공통 입력/프레임 재생 로직은 `sprite-action-tool.ts`로 분리한다.
