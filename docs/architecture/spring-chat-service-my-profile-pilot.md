# spring-chat-service-my-profile-pilot

- backend: `world.yeon.backend.chat_service_my_profile`
- endpoints:
  - `GET /chat-service/profile/me`
  - `PATCH /chat-service/profile/me`
  - `DELETE /chat-service/profile/me`
- header: `X-Yeon-Chat-Profile-Id`
- responsibility:
  - my profile read
  - blocked profiles read
  - my reports read
  - profile update
  - account delete
