# CI/CD Latest Service Guard — 2026-05-12

## 배경

Docker 배포 워크플로우가 성공으로 끝나도 실제 운영 배포가 최신 main 커밋을 반영하지 않을 수 있다. 특히 stale run이 성공 상태로 끝나면 다음 변경 범위 계산의 기준이 오염되어, 최신 main에서 변경된 서비스가 배포 대상에서 빠질 수 있다.

## 1차수 — 최신 main 보장과 변경 서비스 효율 유지

### 작업내용

- stale main run은 성공으로 남기지 않고 자체 cancel 처리한다.
- 변경 범위 기준을 “마지막 성공 Docker run”이 아니라 “마지막 SemVer Release tag(실제 배포 완료 SSOT)”로 바꾼다.
- web/backend/race-server는 변경된 서비스만 빌드·배포한다.
- mobile은 배포 대상 Docker 서비스가 아니므로 변경 시 typecheck 검증만 수행한다.
- 배포 후 변경된 Docker 서비스의 컨테이너 이미지가 `sha-${GITHUB_SHA::7}` 태그인지 검증한다.

### 논의 필요

- 모바일은 현재 EAS/App Store 배포 워크플로우가 없으므로, 이번 차수에서는 “최신 검증”까지만 보장한다.

### 선택지

1. 변경 감지 + 최신 배포 릴리즈 기준 + post-deploy 이미지 검증을 추가한다.
2. 모든 push마다 web/backend/race/mobile 전체를 무조건 빌드/검증한다.
3. 배포 상태 DB/파일을 별도 관리한다.

### 추천

- 1번. 최신 보장을 강화하면서 매번 4개 전체를 돌리는 비효율을 피한다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 검증 계획

- GitHub Actions YAML 구문 검토
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`
