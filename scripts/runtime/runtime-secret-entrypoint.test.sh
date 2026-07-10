#!/bin/sh
set -eu

script_dir="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
temp_dir="$(mktemp -d)"
trap 'rm -rf "$temp_dir"' EXIT

printf 'file-secret\n' > "$temp_dir/AUTH_SECRET"
result="$(
  AUTH_SECRET_FILE="$temp_dir/AUTH_SECRET" \
  YEON_REQUIRED_SECRETS=AUTH_SECRET \
  "$script_dir/runtime-secret-entrypoint.sh" \
  sh -c 'printf %s "$AUTH_SECRET"'
)"
[ "$result" = "file-secret" ]

result="$(
  AUTH_SECRET=local-secret \
  YEON_REQUIRED_SECRETS=AUTH_SECRET \
  "$script_dir/runtime-secret-entrypoint.sh" \
  sh -c 'printf %s "$AUTH_SECRET"'
)"
[ "$result" = "local-secret" ]

if YEON_REQUIRED_SECRETS=AUTH_SECRET \
  "$script_dir/runtime-secret-entrypoint.sh" true \
  >"$temp_dir/stdout" 2>"$temp_dir/stderr"; then
  echo "빈 필수 시크릿 검증이 실패해야 합니다." >&2
  exit 1
fi
grep -q 'AUTH_SECRET 필수 런타임 시크릿이 비어 있습니다.' "$temp_dir/stderr"
