# 게임 source feed 병합 커버리지 보강

## 1차수

### 작업내용

- curated 게임과 GameMonetize feed 병합 시 slug/embed 중복이 중복 노출되지 않는지 테스트로 고정한다.
- feed 기반 상세 조회 fallback과 없는 slug 처리 경계를 테스트로 고정한다.
- 내 게임 slug 목록 해석이 입력 순서를 보존하고 없는 slug를 건너뛰는지 테스트로 고정한다.

### 논의 필요

- 없음. 기능 변경 없이 외부 feed 병합 경계의 테스트 커버리지만 보강한다.

### 선택지

- A. `game-source.ts` 단위 테스트를 추가하고 feed fetch를 mock한다.
- B. Playwright로 허브 UI까지 smoke한다.

### 추천

- A. 장애 가능 지점은 데이터 병합/해석 로직이므로 단위 테스트가 가장 직접적이고 안정적이다.

### 사용자 방향

- 추천 기준으로 진행한다.
