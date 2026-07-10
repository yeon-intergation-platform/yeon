#!/usr/bin/env bash
set -euo pipefail

readonly SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
readonly GUARD="${SCRIPT_DIR}/yeon-prod-runner-job-guard.sh"
readonly REPOSITORY="yeon-intergation-platform/yeon"

run_guard() {
  env -i \
    PATH="$PATH" \
    GITHUB_REPOSITORY="$REPOSITORY" \
    GITHUB_EVENT_NAME="$1" \
    GITHUB_REF="$2" \
    GITHUB_WORKFLOW_REF="$3" \
    bash "$GUARD"
}

run_guard push refs/heads/main \
  "$REPOSITORY/.github/workflows/docker-image.yml@refs/heads/main" >/dev/null
run_guard workflow_dispatch refs/heads/main \
  "$REPOSITORY/.github/workflows/docker-image.yml@refs/heads/main" >/dev/null
if run_guard push refs/heads/main \
  "$REPOSITORY/.github/workflows/docker-build-web.yml@refs/heads/main" >/dev/null 2>&1; then
  echo "이미지 build workflow를 운영 runner에서 허용했습니다." >&2
  exit 1
fi

if run_guard pull_request refs/pull/123/merge \
  "$REPOSITORY/.github/workflows/ssot-check.yml@refs/pull/123/merge" >/dev/null 2>&1; then
  echo "pull_request job을 허용했습니다." >&2
  exit 1
fi

if run_guard workflow_dispatch refs/heads/feature/unsafe \
  "$REPOSITORY/.github/workflows/docker-image.yml@refs/heads/feature/unsafe" >/dev/null 2>&1; then
  echo "main 이외 workflow_dispatch를 허용했습니다." >&2
  exit 1
fi

if run_guard workflow_run refs/heads/main \
  "$REPOSITORY/.github/workflows/auto-release.yml@refs/heads/main" >/dev/null 2>&1; then
  echo "release workflow를 운영 runner에서 허용했습니다." >&2
  exit 1
fi

if run_guard push refs/heads/main \
  "attacker/fork/.github/workflows/docker-image.yml@refs/heads/main" >/dev/null 2>&1; then
  echo "다른 저장소 workflow를 허용했습니다." >&2
  exit 1
fi

echo "production runner job guard tests passed"
