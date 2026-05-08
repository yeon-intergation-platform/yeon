# spring-chat-service-profile-read-pilot

## 작업내용
- `/api/v1/chat-service/profiles/[profileId]` GET을 Spring read endpoint로 이관한다.
- chat-service auth는 Next에 유지한다.

## 논의 필요
- chat-service 세션 검증까지 Spring으로 옮길지 여부

## 선택지
1. auth까지 Spring 이동
2. route auth는 Next 유지, profile read만 Spring 이동

## 추천
- 2. 가장 작은 read lane으로 먼저 분리

## 사용자 방향
- 추천 기준으로 진행
