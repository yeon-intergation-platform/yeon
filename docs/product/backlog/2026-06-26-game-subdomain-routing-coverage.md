# 게임 subdomain routing 커버리지 보강

## 1차수

### 작업내용

- `game.yeon.world`의 root/detail rewrite와 legacy `/game-service/*` canonical redirect를 테스트로 고정한다.
- 게임 상세 URL이 검색 노출 후 실제 subdomain routing에서 깨지는 회귀를 줄인다.

### 논의 필요

- 없음. 기능 변경 없이 기존 라우팅 정책의 테스트 커버리지만 보강한다.

### 선택지

- A. 기존 service subdomain 테스트에 game 케이스를 추가한다.
- B. 별도 Playwright smoke를 새로 만든다.

### 추천

- A. 현재 라우팅 로직은 순수 함수로 분리되어 있어 단위 테스트가 빠르고 직접적이다.

### 사용자 방향

- 추천 기준으로 진행한다.
