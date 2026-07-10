#!/bin/sh
set -eu

script_dir="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
temp_dir="$(mktemp -d)"
trap 'rm -rf "$temp_dir"' EXIT
mkdir -p "$temp_dir/bin" "$temp_dir/cache"

cat > "$temp_dir/bin/docker" <<'SH'
#!/bin/sh
set -eu
count=0
[ ! -f "$FAKE_DOCKER_STATE" ] || count="$(cat "$FAKE_DOCKER_STATE")"
count="$((count + 1))"
printf '%s' "$count" > "$FAKE_DOCKER_STATE"

metadata_file=""
previous=""
for argument in "$@"; do
  if [ "$previous" = "--metadata-file" ]; then
    metadata_file="$argument"
    break
  fi
  previous="$argument"
done

if [ "$count" -lt 3 ]; then
  exit 1
fi

printf '{"containerimage.digest":"sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}\n' > "$metadata_file"
SH
chmod +x "$temp_dir/bin/docker"

PATH="$temp_dir/bin:$PATH" \
FAKE_DOCKER_STATE="$temp_dir/state" \
GITHUB_OUTPUT="$temp_dir/output" \
BUILDX_IMAGE=example.invalid/yeon:test \
BUILDX_FILE=Dockerfile \
BUILDX_METADATA_FILE="$temp_dir/metadata.json" \
BUILDX_RETRY_CLEAN_PATH="$temp_dir/cache" \
BUILDX_RETRY_BASE_DELAY=0 \
bash "$script_dir/buildx-build-with-retry.sh"

[ "$(cat "$temp_dir/state")" = "3" ]
grep -q '^digest=sha256:a\{64\}$' "$temp_dir/output"
