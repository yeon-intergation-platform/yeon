# spring-chat-service-report-pilot

## 작업내용
- `/api/v1/chat-service/reports` POST를 Spring으로 이관한다.
- chat-service auth는 Next에 유지한다.

## 논의 필요
- moderation/read 모델까지 같은 축으로 확장할지 여부

## 선택지
1. report mutation만 먼저 분리
2. moderation 축 전체를 한 번에 이관

## 추천
- 1. 가장 작은 mutation lane으로 먼저 분리

## 사용자 방향
- 추천 기준으로 진행
