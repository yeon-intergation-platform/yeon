# 타자방 만들기 중간 라우트 제거

## 1차

### 작업내용

- `/typing-service/rooms`의 방 만들기 모달 제출이 `/typing-service/rooms/new?...`로 이동하지 않게 한다.
- 모달 제출 시 클라이언트에서 방 생성 요청을 직접 수행하고, 성공 시 `/typing-service/rooms/{roomId}`로 한 번만 이동한다.
- 방 설정값은 query string에 노출하지 않고 request body 또는 클라이언트 이벤트 payload로 전달한다.
- `/typing-service/rooms/new`가 단순 생성 중간 페이지라면 제거하거나 진입 역할을 명확히 분리한다.

### 논의 필요

- 현재 방 생성이 race-server 클라이언트 SDK 기반인지 Next API route 기반인지 실제 구현 확인이 필요하다.

### 선택지

1. 기존 생성 로직을 훅/함수로 추출해 모달 submit에서 직접 호출
2. Next API route를 새로 만들고 모달에서 POST 호출
3. `/rooms/new` 페이지는 유지하되 query redirect만 제거

### 추천

- 1번. 신규 백엔드 역할을 Next에 추가하지 않고, 기존 race-server 생성 경로를 현재 페이지에서 직접 호출하는 방식이 가장 작고 명확하다.

### 사용자 방향

- 추천 기준으로 진행한다.
