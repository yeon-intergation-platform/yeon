# spring-chat-service-ask-pilot

- backend: `world.yeon.backend.chat_service_ask`
- endpoints:
  - `GET /chat-service/ask`
  - `POST /chat-service/ask`
  - `POST /chat-service/ask/{postId}/vote`
- header: `X-Yeon-Chat-Profile-Id`
- responsibility:
  - ask list read
  - blocked relation filtering
  - poll option/vote aggregation
  - ask create
  - vote upsert + poll validation
