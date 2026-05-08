# spring public-check runtime package plan

- package: `world.yeon.backend.public_check_runtime`
- controller:
  - `GET /public-check-sessions/{token}`
  - `POST /public-check-sessions/{token}/verify`
  - `POST /public-check-sessions/{token}/submit`
- service:
  - active session lookup
  - remembered member 재검증 결과 판단용 spaceId 반환
  - verify identity
  - submit + board snapshot/history write + submission insert
- repository:
  - session by public token + owned space publicId lookup
  - members by space / member by publicId
  - public_check_submissions insert
