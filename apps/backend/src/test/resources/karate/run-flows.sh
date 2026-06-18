#!/usr/bin/env bash
# 메인 로직 흐름을 Karate(Cucumber/Gherkin) standalone 으로 검증한다.
#
# 왜 standalone(별도 JVM)인가:
#   Karate 1.4.1(GraalJS)이 Java 25 인프로세스(@SpringBootTest)에서 무한 대기(hang)한다.
#   따라서 앱은 Java 25 로 띄우되, Karate 는 Java 21 로 실행해 그 앱을 HTTP 로 친다.
#
# 사용:
#   1) 백엔드를 먼저 띄운다(예: dev.local 프로파일, 포트 8081, 내부토큰 local-dev-internal-token).
#      SPRING_PROFILES_ACTIVE=dev.local DATABASE_URL=postgresql://yeon_local:yeon_local@localhost:5432/yeon_local \
#      SPRING_INTERNAL_TOKEN=local-dev-internal-token CARD_ASSET_LOCAL_FALLBACK=true \
#      JAVA_HOME=$(sdk home java 25.0.3-amzn) ./gradlew bootRun --args='--server.port=8081'
#   2) 본 스크립트 실행: bash run-flows.sh
#
# 환경변수(선택):
#   KARATE_BASE_URL(기본 http://localhost:8081), SPRING_INTERNAL_TOKEN(기본 local-dev-internal-token),
#   KARATE_USER_ID(기본 고정 UUID), KARATE_JAVA_HOME(Java 21 홈), KARATE_JAR(캐시 경로), KARATE_SEED_USER(기본 1)
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_URL="${KARATE_BASE_URL:-http://localhost:8081}"
INTERNAL_TOKEN="${SPRING_INTERNAL_TOKEN:-local-dev-internal-token}"
USER_ID="${KARATE_USER_ID:-11111111-1111-1111-1111-111111111111}"
KARATE_VERSION="1.4.1"
KARATE_JAR="${KARATE_JAR:-$HOME/.cache/yeon-karate/karate-${KARATE_VERSION}.jar}"

# 1) Karate 실행용 Java 21 탐지
JAVA21_HOME="${KARATE_JAVA_HOME:-$(/usr/libexec/java_home -v 21 2>/dev/null || true)}"
if [ -z "$JAVA21_HOME" ] || [ ! -x "$JAVA21_HOME/bin/java" ]; then
  echo "[run-flows] Java 21 이 필요합니다. KARATE_JAVA_HOME 로 지정하세요." >&2
  exit 1
fi

# 2) karate.jar 준비(없으면 캐시에 내려받음)
if [ ! -f "$KARATE_JAR" ]; then
  echo "[run-flows] karate ${KARATE_VERSION} standalone jar 다운로드..."
  mkdir -p "$(dirname "$KARATE_JAR")"
  curl -fsSL -o "$KARATE_JAR" \
    "https://github.com/karatelabs/karate/releases/download/v${KARATE_VERSION}/karate-${KARATE_VERSION}.jar"
fi

# 3) 백엔드 health 게이트
if ! curl -fsS "${BASE_URL}/actuator/health" >/dev/null 2>&1; then
  echo "[run-flows] 백엔드가 응답하지 않습니다: ${BASE_URL} (먼저 bootRun 으로 띄우세요)" >&2
  exit 1
fi

# 4) card-decks 쓰기 흐름용 테스트 사용자 시드(로컬 docker postgres 사용 시)
if [ "${KARATE_SEED_USER:-1}" = "1" ] && docker ps --format '{{.Names}}' 2>/dev/null | grep -q '^yeon-local-pg$'; then
  users_table_exists="$(
    docker exec yeon-local-pg psql -U yeon_local -d yeon_local -Atq \
      -c "select exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'users');"
  )"
  if [ "$users_table_exists" != "t" ]; then
    echo "[run-flows] public.users 테이블이 없어 사용자 시드를 중단합니다. Spring/Flyway migration 상태를 먼저 확인하세요." >&2
    exit 1
  fi

  docker exec yeon-local-pg psql -v ON_ERROR_STOP=1 -U yeon_local -d yeon_local -c \
    "INSERT INTO public.users (id,email,display_name) VALUES ('${USER_ID}','karate@test.local','Karate Test') ON CONFLICT (id) DO NOTHING;" \
    >/dev/null
fi

# 5) Karate 실행(메인 흐름 feature 전부)
cd "$HERE"
echo "[run-flows] Karate 실행 (Java 21) → ${BASE_URL}"
"$JAVA21_HOME/bin/java" \
  -DbaseUrl="$BASE_URL" -DinternalToken="$INTERNAL_TOKEN" -DuserId="$USER_ID" \
  -jar "$KARATE_JAR" \
  smoke.feature \
  card-deck-assets.feature \
  community-chat.feature \
  card-decks.feature \
  typing-decks.feature \
  card-rooms.feature \
  star-lobby.feature
