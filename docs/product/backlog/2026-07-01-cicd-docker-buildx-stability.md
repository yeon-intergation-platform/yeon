# CI/CD Docker buildx 안정화 백로그

작성일: 2026-07-01

## 배경

`Build, Push, and Deploy Docker Image #891`에서 `build_web / build_arm64`가 `docker/build-push-action` 실행 중 실패했고, GitHub Actions가 해당 job 로그를 제공하지 못했다. 같은 커밋의 `Frontend Quality`와 `SSOT Check`는 성공했고, 로컬 `@yeon/web` production build도 통과했으므로 우선순위는 코드 컴파일 수정이 아니라 self-hosted ARM64 Docker 빌드 경로의 재발 방지다.

과거 buildx cache 사고의 결론은 local cache exporter를 같은 디렉터리에 직접 덮어쓰지 않고 새 디렉터리에 export한 뒤 `index.json`을 검증하고 교체하는 방식이었다. 현재 workflow는 다시 같은 디렉터리를 `cache-from`과 `cache-to`에 동시에 사용하고 있어 cache 손상과 설명 불가능한 빌드 실패가 재발할 수 있다.

## 1차 — local buildx cache 원자적 교체 복구

### 작업내용

- `docker-build-web.yml`, `docker-build-backend.yml`, `docker-build-race.yml`에서 `BUILDX_LOCAL_CACHE_NEW`를 도입한다.
- 빌드 cache export 대상은 기존 cache 디렉터리가 아니라 새 temp 디렉터리로 둔다.
- 빌드 성공 후 `index.json` 존재를 확인하고 새 cache 디렉터리를 기존 cache 디렉터리로 원자적으로 교체한다.
- 실패나 취소가 나도 temp cache 디렉터리는 정리한다.

### 논의 필요

- cache 교체 실패 시 다음 빌드를 cold build로 허용할지, workflow를 실패시킬지 결정해야 한다.

### 선택지

1. cache 교체 검증 실패는 workflow 실패로 처리한다.
2. cache 교체 검증 실패는 warning으로만 남기고 Docker image push 성공은 유지한다.
3. local cache를 완전히 제거하고 registry cache만 사용한다.

### 추천

- 1번. cache 디렉터리가 손상된 상태로 남으면 다음 main 배포가 다시 설명 불가능하게 실패할 수 있으므로 Fail Fast가 맞다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 2차 — 실패 시 러너 상태 진단 로그 보존

### 작업내용

- Docker build job 실패 시 `df -h`, `free -h`, `docker system df`, buildx builder 목록, local cache 크기를 출력한다.
- pre-build 단계에서도 최소 디스크/메모리 상태를 남겨 실패 전후 비교가 가능하게 한다.
- 로그 메시지는 한국어로 유지하되 secret 값은 출력하지 않는다.

### 논의 필요

- runner host에 직접 SSH가 막힌 상황에서도 Actions 로그만으로 원인군을 좁힐 수 있어야 한다.

### 선택지

1. 각 Docker build workflow에 진단 step을 직접 둔다.
2. composite action으로 공통화한다.
3. 별도 수동 diagnostic workflow를 만든다.

### 추천

- 1번. 세 workflow가 작고 구조가 거의 같으므로 과한 추상화보다 직접 step이 재발 방지에 빠르다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 3차 — 에이전트 PR 전 Docker build 누락 방지

### 작업내용

- 웹/Dockerfile/workflow 변경 시 로컬 검증 로그에 `pnpm --filter @yeon/web build` 결과를 포함하도록 작업 로그와 최종 보고 기준을 강화한다.
- 장기적으로는 PR 단계에서 Docker build smoke를 분리할지 검토한다.

### 논의 필요

- PR마다 실제 Docker image build를 돌리면 self-hosted runner 부하와 GHCR 태그 누적이 증가한다.

### 선택지

1. 당장은 로컬 production build를 에이전트 검증 항목으로 강제한다.
2. PR에서 push 없는 Docker build를 항상 실행한다.
3. Dockerfile 또는 배포 workflow 변경 때만 PR Docker build를 실행한다.

### 추천

- 1번을 즉시 적용하고, 3번은 러너 부하를 본 뒤 별도 차수로 진행한다.

### 사용자 방향

- 추천 기준으로 진행한다.
