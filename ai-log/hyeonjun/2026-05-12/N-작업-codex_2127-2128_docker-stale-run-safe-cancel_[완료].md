# Docker stale run 안전 취소 보정

## 목표

최신 main run까지 취소될 수 있는 workflow-level concurrency 부작용을 제거하고, 최신 main run이 stale Docker workflow run만 선별 취소하게 한다.

## 진행

- 작업 브랜치: `codex/cancel-stale-docker-runs-safely`
- 대상: `.github/workflows/docker-image.yml`

## 변경

- workflow-level main 취소를 원래처럼 비활성화했다.
- `actions: write` 권한을 부여하고, 최신 main preflight에서 stale main Docker runs만 GitHub API로 취소하게 했다.
- `detect_changes` stale main 조기 스킵은 유지했다.

## 검증

- `ruby -e "require 'yaml'; YAML.load_file('.github/workflows/docker-image.yml'); puts 'yaml ok'"`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`
