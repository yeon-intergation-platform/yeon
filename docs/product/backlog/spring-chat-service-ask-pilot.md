# spring-chat-service-ask-pilot

## 작업내용
- `/api/v1/chat-service/ask` family를 Spring으로 이관한다.
- chat-service auth는 Next에 유지한다.

## 논의 필요
- 이후 profile/auth보다 social ask/feed를 먼저 다 끝낼지 여부

## 선택지
1. ask read/write/vote만 먼저 분리
2. ask + profile을 함께 이관

## 추천
- 1. ask family를 먼저 thin BFF화하고 profile은 다음 lane으로 넘긴다.

## 사용자 방향
- 추천 기준으로 진행
