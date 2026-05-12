# Docker stale main 빌드 조기 스킵

## 1차

### 작업내용

- `Build, Push, and Deploy Docker Image` 워크플로우에서 최신 main이 아닌 run이 운영 배포 직전에만 스킵되어 Docker 빌드를 끝까지 수행하는 낭비를 줄인다.
- `detect_changes` 단계에서 최신 main 여부를 먼저 확인하고, stale main run이면 web/backend/race 변경 출력을 모두 `false`로 내려 후속 build/publish/deploy job 전체를 스킵한다.
- 빠른 연속 main push에서는 이전 run이 빌드를 계속하지 않도록 workflow concurrency 취소도 main에 적용한다.

### 논의 필요

- 운영 배포 중 새 main push가 들어온 경우 이전 run 취소 가능성을 감수할지.

### 선택지

- A. 배포 job의 기존 방어 로직만 유지한다.
- B. detect_changes에서 stale main을 조기 차단하고 main workflow concurrency도 취소한다.
- C. 빌드 job마다 최신 main 확인 step을 반복 추가한다.

### 추천

- B. 1인 개발 상황에서는 최신 main만 배포/빌드하는 것이 비용과 대기 시간을 가장 크게 줄인다. 배포 job의 기존 최신 main 확인은 마지막 방어선으로 유지한다.

### 사용자 방향

- 기능만 잘 돌아가면 되므로 전부 main에 머지한다. stale run은 배포뿐 아니라 빌드도 스킵하는 방향으로 수정한다.
