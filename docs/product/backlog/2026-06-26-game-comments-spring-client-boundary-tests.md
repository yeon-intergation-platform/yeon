# 게임 댓글 Spring client 경계 테스트 보강

## 1차

### 작업내용

- 게임 댓글 Spring client의 viewer 헤더, 작성 본문, 비밀댓글 확인, 삭제 오류 매핑 테스트를 추가한다.
- 한글 displayName 헤더가 Fetch ByteString 제한으로 실패하지 않도록 웹 인코딩/Spring 디코딩 경계를 고정한다.
- 사용자 기능은 바꾸지 않고 Spring BFF 호출 계약을 테스트로 고정한다.

### 논의 필요

- 없음. 댓글 client만 테스트 공백으로 남아 있어 같은 기준으로 보강한다.

### 선택지

- A. 댓글 client 단위 테스트를 추가한다.
- B. 댓글 route와 client 통합 테스트로 확장한다.
- C. 실제 Spring 서버 E2E를 추가한다.

### 추천

- A. 사용자 조작 API의 호출 계약 회귀를 빠르게 줄인다.

### 사용자 방향

- 추천 기준으로 진행한다.
