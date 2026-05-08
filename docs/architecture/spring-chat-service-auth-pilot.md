# spring-chat-service-auth-pilot

- backend: `world.yeon.backend.chat_service_auth`
- endpoints:
  - `POST /chat-service/auth/request-otp`
  - `POST /chat-service/auth/verify-otp`
  - `GET /chat-service/auth/session`
  - `DELETE /chat-service/auth/session`
- headers:
  - `X-Yeon-Chat-Session-Token`
- responsibility:
  - otp challenge create
  - otp verify + session issue
  - session introspection
  - logout
