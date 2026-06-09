# SSOT parity 복구 및 AI 상시 품질 원칙 컨텍스트 반영

## 1차

### 작업내용

- `node bin/verify-parity.mjs` 실패 원인인 web 카드 덱 목록 화면의 `deriveCardDeckListViewState` SSOT 파생 흔적 누락을 복구한다.
- 사용자가 지정한 SOLID/DRY/KISS/YAGNI/SoC/응집도/결합도/캡슐화/예외/테스트 가능성/가독성 원칙을 project-level AI 상시 컨텍스트(`AGENTS.md`)에 반영한다.
- 변경 후 parity, SSOT, sync-skills, 관련 lint/typecheck를 검증한다.

### 논의 필요

- 별도 없음. 사용자가 CI 실패 해결과 상시 컨텍스트 반영을 명시 지시했다.

### 선택지

1. 화면 파일에 SSOT 파생 주석을 추가해 기존 hook 구조를 유지한다.
2. `deriveCardDeckListViewState` import를 화면 파일로 끌어올려 직접 호출한다.
3. 검증 스크립트를 hook 파일도 인정하도록 수정한다.

### 추천

- 1번. 실제 파생은 이미 `useCardServiceDecksScreenState`에서 수행 중이므로 구조를 바꾸지 않고 검증 스크립트의 의도를 만족시키는 명시 주석만 추가한다.

### 사용자 방향

- 추천 기준으로 진행한다.
