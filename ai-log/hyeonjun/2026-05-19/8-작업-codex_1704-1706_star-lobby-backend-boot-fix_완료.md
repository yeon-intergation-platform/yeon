# 8-작업-codex*1704-1706_star-lobby-backend-boot-fix*완료

## 목표

- 운영 배포에서 backend가 `StarLobbyRealtimePublisher` 빈 생성 실패로 unhealthy가 되는 문제를 해결한다.
- 검증 후 branch → PR(main) → merge까지 완료한다.

## 관측한 원인

- Spring이 `StarLobbyRealtimePublisher` 생성자 후보를 확정하지 못해 기본 생성자를 찾았다.
- 클래스에는 필수 의존성 생성자와 테스트용 package-private 생성자가 함께 있어 기본 생성자가 없다.

## 수정 계획

- 운영용 public 생성자에 `@Autowired`를 명시한다.
- backend 테스트로 Spring 컨텍스트 부팅을 확인한다.

## 수정 내용

- `StarLobbyRealtimePublisher` 운영 생성자에 `@Autowired`를 명시해 Spring이 생성자 주입 경로를 확정하도록 했다.
- Docker 배포 워크플로에서 backend 변경 시 새 이미지를 1회성 컨테이너로 먼저 부팅하고 `/actuator/health`를 확인한 뒤 실제 운영 backend를 교체하도록 했다.

## 검증

- `cd apps/backend && ./gradlew test --tests 'world.yeon.backend.star_lobby.*' --tests 'world.yeon.backend.YeonBackendApplicationTests'` 성공
- `cd apps/backend && ./gradlew bootJar` 성공
- `.github/workflows/docker-image.yml` YAML 파싱 성공
- Docker deploy step shell syntax 확인 성공
