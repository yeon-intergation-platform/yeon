# spring-chat-service-feed-pilot

## 작업내용
- `/api/v1/chat-service/feed` family를 Spring으로 이관한다.
- chat-service auth는 Next에 유지한다.

## 논의 필요
- 이후 ask 축과 함께 social write를 묶을지 여부

## 선택지
1. feed read/write만 먼저 분리
2. feed + ask를 한 번에 이관

## 추천
- 1. feed family를 먼저 thin BFF화하고 ask는 다음 lane으로 넘긴다.

## 사용자 방향
- 추천 기준으로 진행
