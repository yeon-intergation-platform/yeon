# spring-chat-service-profile-read-pilot

- backend: `world.yeon.backend.chat_service_profiles`
- endpoint: `GET /chat-service/profiles/{profileId}`
- header: `X-Yeon-Chat-Profile-Id`
- responsibility:
  - target profile lookup
  - blocked relation check
  - public profile dto response
