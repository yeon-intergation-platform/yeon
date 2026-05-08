# spring-chat-service-chat-rooms-pilot

- backend: `world.yeon.backend.chat_service_chat_rooms`
- endpoints:
  - `GET /chat-service/chat/rooms`
  - `GET /chat-service/chat/rooms/{roomId}`
  - `POST /chat-service/chat/rooms/{roomId}/messages`
- header: `X-Yeon-Chat-Profile-Id`
- responsibility:
  - chat room list/detail read
  - blocked relation guard
  - room participant ownership check
  - message insert + room lastMessageAt 갱신
