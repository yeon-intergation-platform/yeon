#!/bin/sh
set -eu

load_secret() {
  name="$1"
  required="$2"

  case "$name" in
    ''|*[!A-Z0-9_]*)
      echo "허용되지 않은 런타임 시크릿 이름입니다: $name" >&2
      exit 1
      ;;
  esac

  eval "file_path=\${${name}_FILE:-}"
  eval "value=\${${name}:-}"

  if [ -n "$file_path" ]; then
    if [ ! -r "$file_path" ]; then
      echo "$name 시크릿 파일을 읽을 수 없습니다: $file_path" >&2
      exit 1
    fi
    value="$(cat "$file_path")"
  fi

  if [ -z "$value" ]; then
    if [ "$required" = "true" ]; then
      echo "$name 필수 런타임 시크릿이 비어 있습니다." >&2
      exit 1
    fi
    return 0
  fi

  export "$name=$value"
}

load_secret_list() {
  list="$1"
  required="$2"
  old_ifs="$IFS"
  IFS=,
  for name in $list; do
    load_secret "$name" "$required"
  done
  IFS="$old_ifs"
}

load_secret_list "${YEON_REQUIRED_SECRETS:-}" true
load_secret_list "${YEON_OPTIONAL_SECRETS:-}" false
unset YEON_REQUIRED_SECRETS YEON_OPTIONAL_SECRETS

exec "$@"
