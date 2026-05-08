# spring-chat-service-profile-block-pilot

- backend: `world.yeon.backend.chat_service_blocks`
- endpoints:
  - `POST /chat-service/profiles/{profileId}/block`
  - `DELETE /chat-service/profiles/{profileId}/block`
- header: `X-Yeon-Chat-Profile-Id`
- responsibility:
  - target profile existence check
  - self-block guard
  - block row insert/delete
  - friend link cleanup on block
  - blocked profile summary response
