# Docker stale main 빌드 조기 스킵

## 목표

최신 main이 아닌 Docker workflow run이 긴 이미지 빌드를 마친 뒤 운영 배포만 스킵하지 않도록, 빌드 전 단계에서 전체 후속 job을 차단한다.

## 진행

- 작업 브랜치: `codex/skip-stale-docker-builds`
- 대상: `.github/workflows/docker-image.yml`

## 변경

- Docker workflow concurrency를 main 포함 전체 최신 run 취소 방식으로 변경했다.
- `detect_changes` 초기에 최신 main SHA를 확인한다.
- stale main run이면 web/backend/race 출력을 모두 `false`로 내려 build/publish/deploy job이 시작되지 않게 했다.
- 운영 deploy job의 기존 최신 main 방어 로직은 최종 안전장치로 유지했다.

## 검증

- `ruby -e "require 'yaml'; YAML.load_file('.github/workflows/docker-image.yml'); puts 'yaml ok'"`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`
