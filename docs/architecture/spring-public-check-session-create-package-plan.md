# spring public-check session create package plan

- package: `world.yeon.backend.public_check_sessions`
- existing patch lane에 create를 확장한다.

## responsibilities
- repository
  - owned space lookup
  - session insert
- service
  - 위치 기반 조건 검증
  - summary mapping
- controller
  - POST endpoint
