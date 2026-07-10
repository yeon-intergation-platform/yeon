# GitHub Actions + GHCR 운영 배포

기준 시점: 2026-07-11

## 배포 경로

- `main` push 또는 `workflow_dispatch`가 `.github/workflows/docker-image.yml`을 실행한다.
- `develop` 배포 경로는 현재 중단되어 있다.
- Docker 이미지는 GHCR의 `yeon-web-app`, `yeon-backend`, `yeon-race-server`에 저장한다.
- 운영 배포는 publish된 manifest의 `sha256` digest를 사용한다. `sha-<short-sha>`와 `latest`는
  추적/편의를 위한 tag일 뿐 배포 원천이 아니다.

## 러너 경계

- PR과 품질 검증은 job마다 폐기되는 GitHub-hosted `ubuntu-latest` runner를 사용한다.
- ARM64 이미지 build는 GitHub-hosted `ubuntu-24.04-arm`, manifest publish는 `ubuntu-latest`에서
  수행한다.
- `yeon-prod`: publish된 immutable digest를 `/srv/yeon`에 배포하는 작업만 수행하는 운영 러너다.
- registry 정리와 release 작업은 GitHub-hosted runner에서 실행한다.

운영 runner의 root 소유 job-start hook은 `pull_request`와 main 이외 ref를 step 실행 전에 거부한다.
세부 설치와 검증은 [github-actions-runner-isolation.md](./github-actions-runner-isolation.md)를 따른다.

## 권한과 인증

```yaml
permissions:
  contents: read
  packages: write
```

GHCR 로그인은 job-scoped `github.token`을 사용한다. 재사용 workflow에 repository secrets 전체를
넘기는 `secrets: inherit`는 사용하지 않는다.

운영 시크릿의 원천은 GitHub `production` Environment Secrets, 일반 설정의 원천은 같은
Environment Variables다.
이름과 서비스별 전달 범위는 [production-runtime-secrets.md](./production-runtime-secrets.md)를
따른다. 리팩터링된 deploy command는 `/srv/yeon/.env`를 읽지 않고 `.env` 자동 로딩을 명시적으로
비활성화한다.

전환 중인 기존 활성 `/srv/yeon/.env`는 새 배포와 컨테이너 재생성/재시작 검증이 성공한 뒤에만
제거한다. 백업 위치는 [production-runtime-secrets.md](./production-runtime-secrets.md)에 기록한다.

`production` Environment는 custom branch policy로 `main`만 허용한다. 전환 검증 뒤
Repository-level runtime Secret/Variable을 제거해 중복 원천을 남기지 않는다.

## 이미지 배포 흐름

1. 변경 범위를 계산한다.
2. 대상 이미지를 ARM64로 build한다.
3. GHCR OAuth 또는 네트워크 일시 실패는 제한된 횟수와 backoff로 자동 재시도한다.
4. digest를 기준으로 `sha-*`와 `latest` manifest를 만들고 최종 manifest digest를 caller에 반환한다.
5. 운영 Compose preflight를 실행한다.
6. 세 앱의 실제 digest image ref를 렌더링한 Compose를 활성 파일로 원자 교체한다.
7. 변경 서비스와 cloudflared를 `up -d --wait`로 조정한다.
8. Docker metadata의 raw secret 환경변수와 실행 image 불일치를 검사한다.
9. container/public/OAuth/DB health를 확인하고 `.deploy-state`를 갱신한다.
10. 활성 Compose 교체 뒤 어느 검증에서든 실패하면 직전 Compose와 실행 image ID를 자동 복구한다.

## 수동 재배포

컨테이너 재생성은 GitHub Actions의 `workflow_dispatch`로 실행한다. 수동 실행은 Secret 값만
바뀐 경우에도 전체 서비스를 `--force-recreate`한다. 운영 서버에서 `.env`나 임시 secret 파일을
만들어 `docker compose up`을 실행하지 않는다. 기존 컨테이너의 단순 재시작은
`docker restart <container>`로 가능하다.

## 실패 확인 순서

- 필요한 GitHub Secret/Variable 이름이 존재하는지 확인한다. 값은 로그로 출력하지 않는다.
- GitHub-hosted 검증/build job과 `yeon-prod` deploy runner 상태를 각각 확인한다.
- GHCR `packages: write` 권한과 로그인 단계를 확인한다.
- build/push 3회 실패 후의 마지막 오류를 확인한다.
- preflight container 로그와 local health 실패 지점을 확인한다.
- `/srv/yeon/.deploy-state`가 새 배포 SHA와 digest image ref로 갱신됐는지 확인한다.

같은 실패 run을 짧은 간격으로 반복 조회하지 않는다. GitHub API 확인은 제한하고, 운영 상태는
가능하면 서버의 container/health로 검증한다.
