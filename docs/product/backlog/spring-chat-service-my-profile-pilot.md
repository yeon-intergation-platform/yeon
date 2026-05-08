# spring-chat-service-my-profile-pilot

## 작업내용
- `/api/v1/chat-service/profile/me`를 Spring으로 이관한다.
- chat-service auth와 session cookie clear는 Next에 유지한다.

## 논의 필요
- 이후 chat auth/session과 묶을지 여부

## 선택지
1. my-profile read/write/delete만 먼저 분리
2. auth/session까지 한 번에 이관

## 추천
- 1. my-profile lane을 먼저 thin BFF화하고 auth/session은 다음 lane으로 넘긴다.

## 사용자 방향
- 추천 기준으로 진행
