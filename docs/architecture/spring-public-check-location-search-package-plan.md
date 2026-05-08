# spring public-check-location-search package plan

- `world.yeon.backend.public_check_locations.controller.PublicCheckLocationController`
- `world.yeon.backend.public_check_locations.service.PublicCheckLocationService`
- `world.yeon.backend.public_check_locations.service.KakaoLocationGateway`
- `world.yeon.backend.public_check_locations.repository.PublicCheckLocationRepository`

책임:
- Spring이 owned-space check 수행
- Spring이 Kakao keyword/address search 수행
- Next는 auth + Spring 호출만 담당
