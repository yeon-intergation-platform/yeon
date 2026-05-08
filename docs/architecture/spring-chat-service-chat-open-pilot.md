# spring-chat-service-chat-open-pilot

- backend: `world.yeon.backend.chat_service_chat_open`
- endpoint: `POST /chat-service/chat/open`
- header: `X-Yeon-Chat-Profile-Id`
- responsibility:
  - blocked relation/self interaction guard
  - existing room lookup
  - accepted friend link 확인
  - room 생성 + 필요 시 DM unlock 차감/기록
  - room DTO 응답 조합
