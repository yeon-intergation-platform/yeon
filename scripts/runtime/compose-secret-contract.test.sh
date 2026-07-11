#!/bin/sh
set -eu

script_dir="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
repo_root="$(CDPATH= cd -- "$script_dir/../.." && pwd)"
config_file="$(mktemp)"
trap 'rm -f "$config_file"' EXIT

digest="sha256:$(printf 'a%.0s' $(seq 1 64))"

env \
  AUTH_SECRET=test-auth-secret \
  CLOUDFLARE_TUNNEL_TOKEN=test-tunnel-token \
  GOOGLE_CLIENT_ID=test-google-client \
  GOOGLE_CLIENT_SECRET=test-google-secret \
  KAKAO_REST_API_KEY=test-kakao-key \
  KAKAO_CLIENT_SECRET=test-kakao-secret \
  MICROSOFT_CLIENT_ID=test-microsoft-client \
  MICROSOFT_CLIENT_SECRET=test-microsoft-secret \
  NEXT_PUBLIC_APP_URL=https://yeon.world \
  OPENAI_API_KEY=test-openai-key \
  POSTGRES_DB=yeon \
  POSTGRES_PASSWORD=test-postgres-password \
  POSTGRES_USER=yeon \
  R2_ACCESS_KEY_ID=test-r2-access-key \
  R2_ACCOUNT_ID=test-r2-account \
  R2_BUCKET_NAME=test-r2-bucket \
  R2_SECRET_ACCESS_KEY=test-r2-secret-key \
  SPRING_INTERNAL_TOKEN=test-internal-token \
  TYPING_RACE_SEED_SECRET=test-race-seed \
  YEON_CARD_AI_ENABLED=true \
  YEON_CARD_AI_GLOBAL_DAILY_REQUEST_LIMIT=1000 \
  YEON_CARD_AI_GLOBAL_DAILY_TOKEN_LIMIT=5000000 \
  YEON_BACKEND_IMAGE="ghcr.io/example/yeon-backend@$digest" \
  YEON_RACE_SERVER_IMAGE="ghcr.io/example/yeon-race-server@$digest" \
  YEON_WEB_IMAGE="ghcr.io/example/yeon-web-app@$digest" \
  ZAI_API_KEY=test-zai-key \
  docker compose --env-file /dev/null -f "$repo_root/compose.prod.yml" config --format json \
  > "$config_file"

jq -e '
  def environment($service): .services[$service].environment;
  def secret_sources($service): [.services[$service].secrets[].source];
  def has_no_host_ports($service): (.services[$service] | has("ports") | not);

  .services.backend.image == "ghcr.io/example/yeon-backend@sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" and
  .services.web.image == "ghcr.io/example/yeon-web-app@sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" and
  .services["race-server"].image == "ghcr.io/example/yeon-race-server@sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" and

  has_no_host_ports("backend") and
  has_no_host_ports("web") and
  has_no_host_ports("race-server") and

  (environment("backend").AUTH_SECRET | not) and
  (environment("web").AUTH_SECRET | not) and
  (environment("race-server").SPRING_INTERNAL_TOKEN | not) and
  (environment("db").POSTGRES_PASSWORD | not) and

  environment("backend").POSTGRES_PASSWORD_FILE == "/run/secrets/POSTGRES_PASSWORD" and
  environment("backend").ZAI_API_KEY_FILE == "/run/secrets/ZAI_API_KEY" and
  environment("backend").YEON_CARD_AI_ENABLED == "true" and
  environment("backend").YEON_CARD_AI_GLOBAL_DAILY_REQUEST_LIMIT == "1000" and
  environment("backend").YEON_CARD_AI_GLOBAL_DAILY_TOKEN_LIMIT == "5000000" and
  environment("web").GOOGLE_CLIENT_ID == "test-google-client" and
  environment("web").KAKAO_REST_API_KEY_FILE == "/run/secrets/KAKAO_REST_API_KEY" and
  environment("db").POSTGRES_PASSWORD_FILE == "/run/secrets/POSTGRES_PASSWORD" and

  (secret_sources("web") | index("AUTH_SECRET") != null) and
  (secret_sources("backend") | index("POSTGRES_PASSWORD") != null) and
  (secret_sources("backend") | index("ZAI_API_KEY") != null) and
  (secret_sources("web") | index("ZAI_API_KEY") == null) and
  (secret_sources("race-server") | index("TYPING_RACE_SEED_SECRET") != null) and
  (secret_sources("cloudflared") | index("CLOUDFLARE_TUNNEL_TOKEN") != null) and

  (.services.cloudflared.command | index("--token-file") != null) and
  (.services.cloudflared.command | index("/run/secrets/CLOUDFLARE_TUNNEL_TOKEN") != null)
' "$config_file" >/dev/null

if rg -q 'test-(auth-secret|tunnel-token|google-secret|kakao-key|kakao-secret|microsoft-secret|openai-key|postgres-password|r2-access-key|r2-secret-key|internal-token|race-seed|zai-key)' "$config_file"; then
  echo "렌더된 Compose 설정에 raw secret 값이 포함됐습니다." >&2
  exit 1
fi

echo "Compose 런타임 시크릿 계약 검증 통과"
