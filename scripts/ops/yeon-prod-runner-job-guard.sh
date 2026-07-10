#!/usr/bin/env bash
set -euo pipefail

readonly EXPECTED_REPOSITORY="yeon-intergation-platform/yeon"

deny() {
  echo "운영 runner가 신뢰하지 않는 GitHub Actions job을 거부했습니다: $1" >&2
  exit 1
}

[[ "${GITHUB_REPOSITORY:-}" == "$EXPECTED_REPOSITORY" ]] || deny "repository"
[[ -n "${GITHUB_EVENT_NAME:-}" ]] || deny "event 누락"
[[ -n "${GITHUB_REF:-}" ]] || deny "ref 누락"
[[ -n "${GITHUB_WORKFLOW_REF:-}" ]] || deny "workflow ref 누락"

case "${GITHUB_EVENT_NAME}:${GITHUB_REF}" in
  push:refs/heads/main | workflow_dispatch:refs/heads/main)
    ;;
  *)
    deny "${GITHUB_EVENT_NAME}:${GITHUB_REF}"
    ;;
esac

case "$GITHUB_WORKFLOW_REF" in
  "$EXPECTED_REPOSITORY/.github/workflows/docker-image.yml@refs/heads/main")
    ;;
  *)
    deny "허용되지 않은 workflow"
    ;;
esac

echo "운영 runner trust gate 통과: ${GITHUB_EVENT_NAME}:${GITHUB_REF}"
