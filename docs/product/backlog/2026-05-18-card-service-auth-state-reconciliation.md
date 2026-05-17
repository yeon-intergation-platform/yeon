# 카드 서비스 인증 상태 정합성 백로그

## 배경

운영에서 로그인 상태로 인식되는 화면에서 `PATCH /api/v1/card-decks/{deckId}`가 401을 반환하고, 카드 서비스 UI는 이를 “로그인이 만료되었습니다”로 표시한다.

공개 운영 확인 결과:

- 무쿠키 `PATCH /api/v1/card-decks/{deckId}`는 `401 {"message":"로그인이 필요합니다."}`를 반환한다.
- `Authorization: Bearer fake-session-token`으로 `/api/v1/auth/session`을 호출하면 `200 {"authenticated":false}`가 반환되어 web → Spring 내부 토큰 경로는 동작한다.

따라서 우선 해결 대상은 카드 서비스 클라이언트의 로그인 상태와 실제 쿠키 세션 간 stale 상태다.

## 1차수

### 작업내용

- 카드 서비스 auth provider가 초기 서버 prop 이후 실제 `/api/v1/auth/session` 상태와 동기화되도록 한다.
- 덱 수정/삭제 mutation도 카드 수정 mutation처럼 401을 받으면 authenticated 상태를 폐기하고 관련 쿼리를 무효화한다.
- 인증 상태 prop 변화가 provider 내부 state에 반영되는 테스트를 추가한다.

### 논의 필요

- 401을 모두 “세션 만료”로 표시하면 Spring BFF 인증 실패와 사용자 세션 실패가 구분되지 않는다. 이번 차수에서는 사용자 상태 정합성을 먼저 고친다.

### 선택지

1. 덱 mutation 401 처리만 추가한다.
2. auth provider prop 동기화 + `/api/v1/auth/session` 재확인 + 덱 mutation 401 처리를 함께 한다.

### 추천

2번. 단순 mutation 처리만 하면 “로그인 상태라고 보이는 UI”와 실제 쿠키 세션의 불일치가 계속 남는다.

### 사용자 방향

추천 기준으로 진행한다.
