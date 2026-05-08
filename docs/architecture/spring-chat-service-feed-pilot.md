# spring-chat-service-feed-pilot

- backend: `world.yeon.backend.chat_service_feed`
- endpoints:
  - `GET /chat-service/feed`
  - `POST /chat-service/feed`
  - `GET /chat-service/feed/{postId}/replies`
  - `POST /chat-service/feed/{postId}/replies`
- header: `X-Yeon-Chat-Profile-Id`
- responsibility:
  - root feed list read
  - reply list read
  - blocked relation filtering
  - reply count aggregation
  - root/reply post create + parent validation
