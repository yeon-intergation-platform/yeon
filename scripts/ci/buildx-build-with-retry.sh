#!/usr/bin/env bash
set -euo pipefail

: "${BUILDX_IMAGE:?BUILDX_IMAGE가 필요합니다.}"
: "${BUILDX_FILE:?BUILDX_FILE이 필요합니다.}"
: "${BUILDX_METADATA_FILE:?BUILDX_METADATA_FILE이 필요합니다.}"

context="${BUILDX_CONTEXT:-.}"
platforms="${BUILDX_PLATFORMS:-linux/arm64}"
max_attempts="${BUILDX_MAX_ATTEMPTS:-3}"
retry_base_delay="${BUILDX_RETRY_BASE_DELAY:-20}"

build_args=(
  build
  --file "$BUILDX_FILE"
  --platform "$platforms"
  --provenance=false
  --sbom=false
  --output "type=image,name=${BUILDX_IMAGE},push-by-digest=true,name-canonical=true,push=true"
)

append_lines() {
  flag="$1"
  values="$2"
  while IFS= read -r value; do
    [ -n "$value" ] || continue
    build_args+=("$flag" "$value")
  done <<< "$values"
}

append_lines --build-arg "${BUILDX_BUILD_ARGS:-}"
append_lines --label "${BUILDX_LABELS:-}"
append_lines --cache-from "${BUILDX_CACHE_FROM:-}"
append_lines --cache-to "${BUILDX_CACHE_TO:-}"
build_args+=(--metadata-file "$BUILDX_METADATA_FILE" "$context")

for attempt in $(seq 1 "$max_attempts"); do
  rm -f "$BUILDX_METADATA_FILE"
  if docker buildx "${build_args[@]}"; then
    digest="$(
      grep -Eo '"containerimage\.digest"[[:space:]]*:[[:space:]]*"sha256:[0-9a-f]{64}"' "$BUILDX_METADATA_FILE" \
        | head -n 1 \
        | grep -Eo 'sha256:[0-9a-f]{64}' \
        || true
    )"
    if [[ ! "$digest" =~ ^sha256:[0-9a-f]{64}$ ]]; then
      echo "::error::buildx metadata에서 이미지 digest를 확인하지 못했습니다." >&2
      exit 1
    fi
    echo "digest=$digest" >> "${GITHUB_OUTPUT:-/dev/stdout}"
    exit 0
  fi

  if [ "$attempt" -eq "$max_attempts" ]; then
    echo "::error::이미지 build/push가 ${max_attempts}회 모두 실패했습니다." >&2
    exit 1
  fi

  if [ -n "${BUILDX_RETRY_CLEAN_PATH:-}" ]; then
    rm -rf "$BUILDX_RETRY_CLEAN_PATH"
    mkdir -p "$BUILDX_RETRY_CLEAN_PATH"
  fi
  delay="$((attempt * retry_base_delay))"
  echo "이미지 build/push 실패 (${attempt}/${max_attempts}), ${delay}초 후 캐시로 재시도합니다."
  sleep "$delay"
done
