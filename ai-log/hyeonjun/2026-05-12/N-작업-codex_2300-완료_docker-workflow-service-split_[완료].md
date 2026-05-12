# Docker workflow 서비스별 reusable workflow 분리

- 시작: 2026-05-12 23:00 KST
- 목적: `docker-image.yml` 단일 대형 DAG의 서비스별 이미지 빌드 구현을 web/backend/race reusable workflow로 분리한다.
- 범위: `.github/workflows/docker-image.yml`, `.github/workflows/docker-build-*.yml`, CI/CD 백로그/작업 로그
- 안전장치: 운영 배포 job은 단일 `deploy_production` orchestrator로 유지해 Raspberry Pi compose 반영을 직렬화한다.

## 결과

- `docker-image.yml`은 변경 범위 판별, stale main cancel/자동 보정, reusable build workflow 호출, 단일 `deploy_production`만 담당하도록 축소했다.
- web/backend/race 이미지 빌드와 manifest publish는 각각 `docker-build-web.yml`, `docker-build-backend.yml`, `docker-build-race.yml`로 분리했다.
- 운영 반영은 단일 deploy job으로 유지해 compose 동시 조작 위험을 피했다.
- `develop` trigger는 프로젝트 정책에 맞춰 top-level workflow에서 제거했다.

## 검증

- `ruby -e 'require "yaml"; ... YAML.load_file(...)'` 통과
- `actionlint .github/workflows/docker-image.yml .github/workflows/docker-build-web.yml .github/workflows/docker-build-backend.yml .github/workflows/docker-build-race.yml` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 실행: git worktree의 `.git` 파일 구조 때문에 프로젝트 검사는 스킵됨(스크립트 한계), 전역 SSOT OK
