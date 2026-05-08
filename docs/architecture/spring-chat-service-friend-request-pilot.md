# spring-chat-service-friend-request-pilot

- backend: `world.yeon.backend.chat_service_friend_requests`
- endpoint: `POST /chat-service/friends/requests`
- header: `X-Yeon-Chat-Profile-Id`
- responsibility:
  - self interaction guard
  - blocked relation guard
  - target profile existence check
  - pending request insert / reverse request accept
