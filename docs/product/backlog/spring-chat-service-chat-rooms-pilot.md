# spring-chat-service-chat-rooms-pilot

## 작업내용
- `/api/v1/chat-service/chat/rooms` family를 Spring으로 이관한다.
- chat-service auth는 Next에 유지한다.

## 논의 필요
- 이후 `feed/ask` 축보다 chat auth/session을 먼저 옮길지 여부

## 선택지
1. rooms read/write만 먼저 분리
2. chat-service 축 전체를 한 번에 이관

## 추천
- 1. rooms family를 먼저 thin BFF화하고 나머지 축은 다음 lane으로 넘긴다.

## 사용자 방향
- 추천 기준으로 진행
