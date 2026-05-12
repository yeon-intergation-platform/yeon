# chat-service auth routes Spring cutover

## 1차

### 작업내용
- `/api/v1/chat-service/auth/request-otp`를 Spring auth endpoint 호출로 전환한다.
- `/api/v1/chat-service/auth/verify-otp`를 Spring auth endpoint 호출로 전환하고 기존 session cookie 설정은 Next BFF에 유지한다.
- `/api/v1/chat-service/auth/session` GET/DELETE를 Spring auth endpoint 호출로 전환하고 cookie bridge는 유지한다.

### 논의 필요
- `_shared`의 `requireChatServiceAuth`/`getOptionalChatServiceAuth`도 아직 Next legacy auth-service를 사용하므로 다음 차수에서 Spring session 조회로 바꿔야 한다.

### 선택지
1. 외부 route 3개를 먼저 Spring client로 얇게 바꾼다.
2. `_shared` 인증 헬퍼까지 한 번에 바꾼다.

### 추천
- 1번. session cookie/Authorization bridge는 유지하면서 route 단위 위험을 줄인다.

### 사용자 방향
- 추천 기준으로 진행한다.
