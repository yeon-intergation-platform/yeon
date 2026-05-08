# spring-chat-service-auth-pilot

## 작업내용
- `/api/v1/chat-service/auth/*`를 Spring으로 이관한다.
- cookie set/clear와 bearer/cookie token 추출은 Next에 유지한다.

## 논의 필요
- 이후 `_shared`의 `requireChatServiceAuth` 자체를 Spring introspection으로 바꿀지 여부

## 선택지
1. OTP/session 비즈니스만 먼저 분리
2. auth helper 전체를 한 번에 이관

## 추천
- 1. OTP/session 비즈니스만 먼저 Spring으로 옮기고 helper 정리는 다음 lane으로 넘긴다.

## 사용자 방향
- 추천 기준으로 진행
