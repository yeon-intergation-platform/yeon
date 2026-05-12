# Docker stale main 배포 자동 보정

## 배경

2026-05-12 운영 배포에서 Docker image workflow는 성공으로 종료됐지만, `deploy_production` 단계가 최신 `main`이 아니라는 이유로 실제 Raspberry Pi 배포를 스킵했다. 직후 머지된 문서/백로그성 커밋은 Docker workflow path trigger 대상이 아니어서 최신 `main` 배포가 자동으로 다시 실행되지 않았고, 운영 `https://yeon.world`가 로컬/main 결과와 달라졌다.

## 1차

### 작업내용

- `deploy_production`의 최신 main 검사에서 stale run을 감지하면 단순 스킵으로 끝내지 않는다.
- 최신 `main` SHA에 대해 같은 Docker workflow run이 queued/in_progress/completed success 상태로 이미 존재하는지 확인한다.
- 없으면 `docker-image.yml`을 `workflow_dispatch`로 자동 재실행해 최신 `main` 기준 배포를 보정한다.
- 무한 dispatch를 막기 위해 기존 run 존재 여부를 먼저 확인하고, 현재 run은 제외한다.

### 논의 필요

- 보정 dispatch는 docs-only 커밋까지 포함한 최신 main 전체 배포를 유도하므로, 불필요한 전체 이미지 빌드가 발생할 수 있다.

### 선택지

1. stale run에서 최신 main workflow를 자동 dispatch한다.
2. Docker workflow trigger paths에 `docs/**`까지 포함해 모든 문서 머지 후 배포를 돌린다.
3. 운영 배포 성공 SHA를 별도로 저장하고 release job에서 감시한다.

### 추천

1번. 실제 장애 원인인 “stale run은 스킵됐고 최신 docs-only main은 Docker workflow를 안 탐” 구멍만 직접 막는다. 2번보다 낭비가 적고, 3번보다 구현 범위가 작다.

### 사용자 방향

수동 해결책이 아니라 예방해야 한다. 다시는 같은 일이 없도록 자동 보정한다.

## 검증 계획

- Shell 구문 검증: `bash -n`로 workflow 내 신규 스크립트와 동등한 heredoc 검증
- 문서/워크플로우 변경 검증:
  - `git diff --check`
  - `bash bin/sync-skills.sh --check`
  - `bash bin/verify-ssot.sh --project-only`

## 2차 후속 개선안: workflow 분리

### 작업내용

- 현재 `docker-image.yml`의 build/deploy 통합 DAG를 한 번에 갈아엎지 않고, 후속 PR에서 아래 순서로 분리한다.
  1. web/backend/race 이미지 빌드를 reusable workflow 또는 서비스별 workflow로 분리
  2. 서비스별 path trigger와 concurrency group 분리
  3. 운영 반영은 단일 deploy lock을 유지하되 변경 서비스만 `docker compose pull/up`
  4. `workflow_dispatch`도 전체 서비스 true가 아니라 최신 배포 SHA 기준 diff로 변경 서비스만 재계산

### 논의 필요

- 서버의 단일 `compose.prod.yml`을 여러 deploy job이 동시에 조작하면 위험하므로, 빌드는 완전 병렬화하되 운영 반영은 단일 락을 유지하는 편이 안전하다.

### 선택지

1. 서비스별 build workflow + 단일 deploy orchestrator
2. 서비스별 build workflow + 서비스별 deploy workflow
3. 현행 단일 workflow 유지 + 내부 job만 정리

### 추천

1번. 빌드는 빠르게 병렬화하면서도 Raspberry Pi의 compose 반영은 직렬화해 운영 안정성을 유지한다.

### 사용자 방향

CI/CD 분리는 별도 구조 개선 PR로 안전하게 진행한다. 이번 PR은 stale deploy 자동 보정만 적용한다.
