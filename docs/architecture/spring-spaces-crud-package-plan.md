# spring spaces CRUD package plan

- `world.yeon.backend.spaces.controller.SpaceController`
- `world.yeon.backend.spaces.dto.*`
- `world.yeon.backend.spaces.repository.SpaceRepository`
- `world.yeon.backend.spaces.service.SpaceService`
- `world.yeon.backend.spaces.service.SpaceServiceException`

생성 경로는 같은 service 안에서:
- space insert
- default system tabs insert
- overview fields bootstrap
를 한 transaction으로 처리한다.
