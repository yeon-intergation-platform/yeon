# spring public-check session patch package plan

- package: `world.yeon.backend.public_check_sessions`
- subpackages
  - `controller`
  - `dto`
  - `repository`
  - `service`

## responsibilities
- repository
  - owned space lookup
  - owned session update
- service
  - patch field normalization
  - 404/400 translation
- controller
  - PATCH endpoint
