# buildx 캐시 누적 및 운영 호스트 디스크 안정화 백로그

기준일: 2026-06-11
작성자: Codex

## 배경

운영 호스트 `ssh.yeon.world`에서 `/` 사용률이 97%까지 증가했고, 원인 대부분이 GitHub Actions self-hosted ARM64 빌드용 local buildx cache였다.

- `/home/osumaniaddict527/.cache/buildx-yeon-web-arm64`: 117GB
- `/home/osumaniaddict527/.cache/buildx-yeon-backend-arm64`: 12GB
- `/home/osumaniaddict527/.cache/buildx-yeon-race-arm64`: 17GB

Docker 공식 문서 기준 local cache exporter는 오래된 캐시 엔트리를 자동 삭제하지 않아 캐시 크기가 계속 커질 수 있으므로, CI에서 새 캐시 디렉터리로 export한 뒤 기존 캐시를 교체하는 rotate 단계가 필요하다.

## 1차

### 작업내용

- 운영 호스트 buildx local cache 3종을 정리해 즉시 디스크 여유 공간을 확보한다.
- web/backend/race ARM64 Docker workflow에서 local cache export 대상을 임시 디렉터리로 변경한다.
- 빌드 성공 후 임시 캐시를 기존 캐시 경로로 원자적으로 교체해 오래된 blob 누적을 제거한다.
- 실패/취소 시 임시 캐시 디렉터리를 정리한다.

### 논의 필요

- 캐시를 완전히 없애면 빌드 시간이 늘 수 있다.
- 캐시를 유지하되 rotate를 적용하면 최신 캐시만 보존해 속도와 디스크 안정성의 균형을 맞출 수 있다.

### 선택지

1. local buildx cache를 완전히 비활성화한다.
2. local cache를 유지하되 Docker 문서 방식의 move-cache/rotate를 적용한다.
3. registry cache만 남기고 self-hosted local cache는 제거한다.

### 추천

2번. ARM64 Pi runner의 느린 네트워크 문제 때문에 local cache는 유지하되, 같은 디렉터리에 계속 export해 오래된 blob이 누적되는 구조를 제거한다.

### 사용자 방향

추천 기준으로 진행한다.

## 2차

### 작업내용

- 디스크 사용량의 추가 원인(오래된 Docker images, runner workdir, 로그)을 재측정한다.
- 배포/러너 workflow에 이미 있는 정리 단계가 실제 누적 원인을 커버하는지 확인한다.
- 배포 호스트에 남는 Yeon GHCR `sha-*` 이미지가 65GB 수준으로 누적되어, 배포 성공 후 미사용 로컬 Yeon 이미지 정리 단계를 추가한다.

### 논의 필요

- 사용 중이 아닌 Docker image까지 공격적으로 정리하면 롤백 편의성이 낮아질 수 있다.

### 선택지

1. buildx 캐시 rotate만 이번 PR에 포함한다.
2. Docker image prune 정책까지 같은 PR에 포함한다.
3. 레지스트리 정리까지 같은 PR에 포함한다.

### 추천

2번. 직접 원인은 145GB buildx local cache지만, 배포 호스트 로컬 이미지도 65GB 수준으로 누적되어 같은 디스크 장애 재발 요인이다. 단, `docker image prune -a`처럼 전체 이미지를 지우지 않고 Yeon GHCR `sha-*` 이미지에만 한정하며 실행 중 이미지와 최신 10개는 보존한다.

### 사용자 방향

추천 기준으로 진행한다.
