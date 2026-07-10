# Raspberry Pi Docker Compose 운영

기준 시점: 2026-07-11

이 문서는 현재 Raspberry Pi 운영 호스트의 실행 원칙만 다룬다. 시크릿 이름, 전달 구조,
백업과 롤백의 SSOT는 [production-runtime-secrets.md](./production-runtime-secrets.md)다.

## 현재 운영 모델

- 배포 브랜치: `main`만 사용한다. `develop` 배포는 중단된 상태다.
- 배포 디렉터리: `/srv/yeon`
- Compose 파일: `/srv/yeon/compose.prod.yml`
- 서비스: `db`, `backend`, `web`, `race-server`, `cloudflared`
- 외부 네트워크: `yeon-edge`, `yeon-db-edge`
- 이미지 빌드/GHCR 게시: 일회성 GitHub-hosted ARM64 runner가 담당한다.
- 운영 배포: 보호된 `yeon-prod` self-hosted runner가 digest만 받아 수행한다.
- PR, 테스트, lint, typecheck, SSOT 검증: GitHub-hosted `ubuntu-latest` runner가 담당한다.

컷오버가 끝난 운영 디렉터리에는 활성 `.env`를 두지 않는다. 현재 기존
`/srv/yeon/.env`는 새 배포와 컨테이너 재생성/재시작 검증이 성공할 때까지 유지하며, 검증 전에
삭제하지 않는다. 전환 중에도 이 파일을 수정하지 않고 `production` Environment만 변경 원천으로
사용한다.

```text
/srv/yeon/
  compose.prod.yml
  .deploy-state
  backups/
```

`backups/` 아래의 과거 `.env` 사본은 장애 복구 전용이며 Compose가 자동으로 읽는 활성 설정이
아니다. 권한은 디렉터리 `700`, 파일 `600`을 유지한다.
최초 이관 백업은 `/srv/yeon/backups/secret-migration/20260710T171840Z`에 있다.

## 배포 흐름

1. `main` 변경 범위를 감지한다.
2. 변경된 ARM64 이미지를 GHCR에 push하고 publish된 manifest digest를 얻는다.
3. `production` Environment의 main-only deploy step이 Secrets/Variables를 받는다.
4. Docker Compose가 시크릿을 `/run/secrets/<NAME>` 파일로 서비스별 전달한다.
5. 새 이미지 preflight와 health check를 통과한 서비스만 교체한다.
6. 실제 GHCR digest image가 렌더링된 활성 Compose와 image ID를 `/srv/yeon/.deploy-state`에 기록한다.

컨테이너를 새로 만드는 `docker compose up`, `run`, `create`는 GitHub Actions 배포 workflow에서만
실행한다. 운영 호스트에는 재생성에 필요한 원본 시크릿이 없기 때문이다.

## 운영 호스트에서 허용되는 점검

값을 요구하지 않는 조회와 기존 컨테이너 재시작은 서버에서 직접 실행할 수 있다.

```bash
cd /srv/yeon
docker compose --env-file /dev/null -f compose.prod.yml ps
docker compose --env-file /dev/null -f compose.prod.yml logs --tail=200 backend web race-server cloudflared
docker compose --env-file /dev/null -f compose.prod.yml ps -q \
  | xargs -r docker restart
```

`docker restart`는 기존 컨테이너의 `/run/secrets`를 보존한다. 재생성이 필요하면 GitHub Actions의
`workflow_dispatch`를 사용한다. 수동 workflow는 같은 image digest라도 다섯 서비스를
`--force-recreate`해 회전된 `/run/secrets` 값을 반영한다.

## 네트워크와 Tunnel

- `yeon.world`, 서비스 subdomain은 `cloudflared`에서 `yeon-edge`의 서비스 alias로 전달한다.
- web/backend/race는 host port를 publish하지 않는다. health도 container network에서 검사한다.
- DB WARP 경로는 `yeon-db-edge`를 사용한다.
- Tunnel token은 Compose command나 Docker metadata에 직접 넣지 않고
  `/run/secrets/CLOUDFLARE_TUNNEL_TOKEN`을 `--token-file`로 읽는다.
- cloudflared도 `compose.prod.yml`이 소유하며 별도 수동 컨테이너로 만들지 않는다.

## 장애 확인 순서

1. `/srv/yeon/.deploy-state`의 배포 SHA, digest image ref와 image ID를 확인한다.
2. `docker compose ... ps`에서 다섯 서비스 상태를 확인한다.
3. backend/web/race의 local health와 DB `pg_isready`를 확인한다.
4. 공개 `yeon.world`, `blurt.yeon.world`, `race.yeon.world`를 확인한다.
5. 재생성이 필요하면 서버에서 임의 환경변수를 만들지 말고 배포 workflow를 재실행한다.

DB volume을 삭제하는 `docker compose down -v`는 금지한다.
