# CI/CD 누적 diff 기반 선택 배포 백로그

## 1차 — main 동시 머지 안전성과 선택 배포 효율 동시 확보

### 작업내용
- `docker-image.yml`의 main 변경 감지를 push event `before..sha`가 아니라 마지막 성공한 main 배포 run의 `headSha..현재 sha` 기준 누적 diff로 바꾼다.
- 마지막 성공 배포 run을 GitHub Actions API로 조회하고, 기준 SHA를 찾지 못하면 전체 서비스 배포로 fail-safe 처리한다.
- develop 및 `workflow_dispatch` 동작은 기존 의미를 유지한다.
- CI/배포 안정화 변경이므로 root `package.json` 버전을 PATCH로 올리고 `v0.0.1` GitHub Release 기준을 맞춘다.

### 논의 필요
- 마지막 성공 배포 기준을 GitHub Actions run으로 둘지, 운영 서버의 `.last-successful-deploy-sha` 파일로 둘지.

### 선택지
1. main은 항상 전체 배포한다.
2. 운영 서버 파일에 마지막 배포 SHA를 저장하고 이를 기준으로 diff한다.
3. GitHub Actions API에서 마지막 성공한 main 배포 run의 head SHA를 찾아 누적 diff한다.

### 추천
- 3번을 우선 적용한다. 빌드 단계부터 필요한 서비스만 선택할 수 있고, 추가 서버 상태 파일 없이 GitHub Actions 기록을 활용할 수 있다.
- 기준 SHA를 찾지 못하거나 checkout에 없으면 전체 배포로 fallback한다.

### 사용자 방향
- 운영 최적해를 선택한다. main 동시 머지에도 누락 없이, 필요한 서비스만 배포한다.
- 버전관리도 함께 적용한다.
