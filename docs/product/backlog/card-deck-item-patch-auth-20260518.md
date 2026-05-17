# 카드 덱 item PATCH 인증 401 복구 백로그

## 1차

### 작업내용

- 운영에서 로그인 상태인데 `PATCH /api/v1/card-decks/{deckId}/items/{itemId}`가 401을 반환하는 원인을 추적한다.
- Next BFF/Spring client 인증 헤더 전달 경계를 점검하고 최소 수정으로 복구한다.
- 덱 제목 수정, 카드 수정 등 card-decks write API의 인증 회귀를 테스트로 고정한다.

### 논의 필요

- 없음. 로그인 사용자의 write API가 401이 되는 것은 명백한 버그다.

### 선택지

- A. Next BFF 인증 브리지 누락을 복구한다.
- B. Spring 권한 정책을 완화한다.
- C. 클라이언트에서 우회 토큰을 추가한다.

### 추천

- A. 인증 source of truth를 유지하면서 BFF가 로그인 사용자 식별자를 Spring에 정확히 전달하게 한다.

### 사용자 방향

- 추천 기준으로 진행한다.
