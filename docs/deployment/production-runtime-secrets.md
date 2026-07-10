# 운영 런타임 시크릿

## 원칙

운영 시크릿의 원천은 GitHub `production` Environment Secrets다. 일반 운영 설정은 같은
Environment Variables다.
컷오버 후 운영 호스트의 `/srv/yeon/.env`는 사용하지 않는다. 배포 job은
`COMPOSE_DISABLE_ENV_FILE=1`과 `--env-file /dev/null`을 함께 사용해 주변 `.env`가 있어도 읽지
않는다.

저장소는 public이고 `production` Environment의 custom branch policy는 `main`만 허용한다.
`main` branch는 PR 경유, 최신 branch, SSOT check, conversation resolve를 강제하며 force-push와
삭제를 금지한다. Repository-level runtime Secret/Variable은 전환 완료 뒤 제거해 중복 원천을
남기지 않는다.

## 전환 상태

- `production` Environment와 main-only policy 구성은 완료됐다.
- PR/품질 job과 ARM64 build/publish는 일회성 GitHub-hosted runner에서 실행한다. 보호된
  `yeon-prod` runner는 검증된 digest의 운영 배포만 수행한다.
- 과거 `yeon-ci` runner와 OS 계정은 제거했다.
- `/srv/yeon/backups/secret-migration/20260710T171840Z` 백업은 완료했다.
- 활성 `/srv/yeon/.env`는 성공한 새 배포, 컨테이너 재생성, 재시작 및 공개 health 검증이 끝날
  때까지 보존한다. 이 파일은 기존 컨테이너 복구를 위한 동결된 전환 사본이지 수정할 SSOT가
  아니다. 현재 존재 자체를 컷오버 완료로 오해하거나 먼저 삭제하지 않는다.

## 런타임 전달

1. `main`의 `production` 배포 job만 GitHub Secrets/Variables를 step environment로 받는다.
2. Docker Compose의 `secrets.<name>.environment`가 값을 컨테이너의
   `/run/secrets/<NAME>` 파일로 전달한다.
3. web/race는 distroless Node 로더, backend는 non-root entrypoint가 파일을 읽은 뒤 기존 앱을
   같은 PID로 시작한다. 이 호환 계층은 앱 process environment에 값을 hydrate하지만 Docker image,
   Compose, container metadata에는 값을 기록하지 않는다. PostgreSQL과 cloudflared는 각 이미지의
   file 옵션을 직접 사용한다.
4. Docker container metadata에는 값 대신 `*_FILE=/run/secrets/...` 경로만 남는다.

Compose v5.1.1 운영 호스트에서 environment-source secret을 사용한 임시 컨테이너를 만들고
직접 환경변수 없이 `docker restart`와 `docker compose up --no-recreate`를 실행해 secret 파일이
유지되는 것을 확인했다. 컨테이너를 새로 만드는 작업은 반드시 GitHub 배포 workflow를 통해
수행한다.

## 최소 권한

- `web`: 인증, Spring 내부 토큰, 타자 seed, OpenAI/Z.ai, R2
- `backend`: 인증, DB password, Spring 내부 토큰, 타자 seed, OAuth provider, OpenAI, R2
- `race-server`: Spring 내부 토큰, 타자 seed
- `db`: PostgreSQL 비밀번호
- `cloudflared`: Cloudflare Tunnel 토큰

PR workflow와 image build/publish는 job마다 폐기되는 GitHub-hosted runner만 사용한다. 운영
web/backend/race는 host port를 publish하지 않고 cloudflared와 Docker network로만 통신한다.
`yeon-prod` runner의 root 소유 job-start hook은 `docker-image.yml`의 main 배포 외 모든 job을 step
실행 전에 거부한다.

## GitHub 값 분류

`production` Environment Secrets:

- `AUTH_SECRET`, `SPRING_INTERNAL_TOKEN`, `TYPING_RACE_SEED_SECRET`
- `POSTGRES_PASSWORD` (`DATABASE_URL`은 운영 Secret으로 중복 저장하지 않음)
- `GOOGLE_CLIENT_SECRET`, `KAKAO_REST_API_KEY`, `KAKAO_CLIENT_SECRET`,
  `MICROSOFT_CLIENT_SECRET`
- `OPENAI_API_KEY`, `ZAI_API_KEY`
- `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`
- `CLOUDFLARE_TUNNEL_TOKEN`
- source-map 업로드 경로가 없는 `SENTRY_AUTH_TOKEN`은 GitHub에 보관하지 않는다.

`production` Environment Variables:

- public OAuth client ID, app URL, DB name/user
- OpenAI/Z.ai model 설정
- R2 account/bucket/endpoint
- Sentry DSN/org/project, 관리자 이메일, feature flag

`POSTGRES_PASSWORD`는 DB와 backend가 함께 읽는 단일 비밀번호 원천이다. backend는 non-secret
`POSTGRES_HOST/PORT/DB/USER`와 이 값을 조합한다. 비밀번호가 포함된 `DATABASE_URL`을 두 번째
GitHub Secret으로 저장하지 않는다. PostgreSQL 공식 이미지의 `POSTGRES_PASSWORD_FILE`은 빈
데이터 디렉터리를 처음 만드는 시점에만 role 비밀번호를 설정한다. 기존 `postgres-data` volume에서
컨테이너를 재생성해도 DB role 비밀번호는 자동으로 바뀌지 않는다.

DB 비밀번호 회전은 현재 지원하지 않는다. GitHub Secret을 먼저 바꾸면 새 backend preflight가
기존 role 비밀번호로 접속할 수 없어 배포 전에 실패한다. 회전 전용 maintenance workflow가
**기존 credential로 DB 접속 → 새 값을 stdin으로 `ALTER ROLE` → environment Secret 갱신 →
backend/db 즉시 강제 재생성 → health/쓰기 확인**을 한 경계에서 수행하고, 실패 trap에서 이전 role
비밀번호와 기존 backend를 복구하도록 구현되기 전에는 `POSTGRES_PASSWORD`를 변경하지 않는다.

첫 이관의 `TYPING_RACE_SEED_SECRET`은 기존 fallback이던 `AUTH_SECRET`과 같은 값으로 초기화한다.
별도 seed key 회전은 활성 race seed 만료와 함께 후속 작업으로 수행한다.

## 운영 검증

배포 성공 조건:

- `docker compose --env-file /dev/null config --quiet`
- backend/web/race/cloudflared preflight 성공
- db/backend/web/race/cloudflared 실행 및 health 성공
- 모든 컨테이너 metadata에 raw secret 환경변수 이름이 없음
- cloudflared command가 `--token-file`을 사용함
- `/srv/yeon/.deploy-state`에 실제 실행 image ref와 image ID가 기록됨
- 활성 Compose에 세 앱의 immutable GHCR digest image ref가 직접 렌더링됨
- preflight 직후 활성 Compose를 원자 교체하고 직전 파일을 `.compose.prod.yml.previous`로 보존함
- 활성 Compose 교체 뒤 실패하거나 취소되면 직전 Compose, 실행 image ID와 공개 health까지 자동 복구함
- 컨테이너 restart 뒤 local/public health가 다시 성공함

값을 로그, artifact, cache, `GITHUB_ENV`, command argument로 출력하거나 저장하지 않는다.

## 백업과 롤백

최초 이관 백업은 `/srv/yeon/backups/secret-migration/20260710T171840Z`다. 디렉터리는 `700`,
파일은 `600`이다. `.env`, 이전 Compose/배포 상태와 이전 cloudflared inspect가 들어 있다. 이
백업은 활성 설정이 아니며 복구 전용 평문 사본이다. 외부 키를 모두 회전한 뒤에는 암호화
보관하거나 폐기한다.

배포 workflow는 활성 Compose를 교체한 뒤 실패하거나 취소되면 직전 Compose와 세 앱의 실제 실행
image ID를 자동 복구하고 공개 health를 다시 확인한다. 최초 컷오버의 구형 Compose는 현재 GitHub
Environment가 frozen `.env`를 덮어쓰지 못하도록 빈 프로세스 환경에서 실행한다. 구형 Compose에
cloudflared 정의가 없으면 preflight를 통과한 새 connector를 유지한다.

수동 롤백 시:

1. 백업의 `compose.prod.yml`, `.env`, `.deploy-state`, `cloudflared.inspect.json`을 확인한다.
2. 이전 Compose와 `.env`를 복구용 임시 경로에서만 사용한다.
3. 다음처럼 보호된 `.deploy-state`의 실제 image ref를 대문자 Compose 변수로 명시한다.

   ```bash
   backup=/srv/yeon/backups/secret-migration/20260710T171840Z
   (
     source "${backup}/.deploy-state"
     YEON_WEB_IMAGE="${web_image}" \
     YEON_BACKEND_IMAGE="${backend_image}" \
     YEON_RACE_SERVER_IMAGE="${race_image}" \
       docker compose --env-file "${backup}/.env" -f "${backup}/compose.prod.yml" \
         up -d --wait --force-recreate db backend web race-server
   )
   ```

4. 이전 Compose에는 cloudflared 서비스가 없으므로 새 cloudflared가 정상이면 그대로 유지한다.
5. Tunnel transport 자체를 되돌려야 할 때만 같은
   백업 디렉터리의 보호된 `cloudflared.inspect.json`을 기준으로 별도 복구한다.
6. DB volume은 삭제하지 않는다. `docker compose down -v`는 금지한다.

`AUTH_SECRET`은 기존 암호문과 세션에 연결되므로 이관 중 회전하지 않는다. 외부 API/OAuth/R2,
Tunnel key 회전은 transport 이관이 안정화된 뒤 서비스별로 수행한다.

`workflow_dispatch`로 Secret 자체를 회전한 직후 실패한 경우 GitHub는 이전 Secret 값을 제공하지
않는다. 자동 롤백은 이전 Compose와 image를 복구하지만 이전 credential 값까지 되돌리지는 못한다.
DB 비밀번호처럼 상태와 함께 바뀌는 값은 별도 회전 workflow 없이 변경하지 않는다.
