# chat-service feed Spring route cutover

## 1차

### 작업내용

- `/api/v1/chat-service/feed` GET/POST를 Next DB 서비스 직접 호출에서 Spring client 호출로 전환한다.
- `/api/v1/chat-service/feed/{postId}/replies` GET/POST를 Spring client 호출로 전환한다.
- Spring feed 목록 조회는 비로그인 요청도 허용해 기존 Next 동작과 맞춘다.
- PATCH/DELETE는 Spring 수정/삭제 API가 아직 없으므로 이번 차수에서는 기존 legacy 경계를 유지한다.

### 논의 필요

- feed 글 수정/삭제까지 같은 차수에 옮기려면 Spring controller/service/repository API 추가가 필요하다.

### 선택지

1. GET/POST 목록·작성만 먼저 Spring으로 전환한다.
2. 수정/삭제 API까지 Spring에 새로 추가해서 feed 전체를 한 번에 전환한다.

### 추천

- 1번. 작은 단위로 이관하고 기존 사용자 동작을 유지한다.

### 사용자 방향

- 추천 기준으로 진행한다.
