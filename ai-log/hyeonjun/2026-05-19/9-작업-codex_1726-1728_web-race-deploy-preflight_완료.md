# 9-작업-codex*1726-1728_web-race-deploy-preflight*완료

## 목표

- Docker production deploy에서 web/race-server도 새 이미지 preflight가 성공해야 운영 컨테이너를 교체하도록 보강한다.
- 검증 후 PR(main) → merge까지 완료한다.

## 관측한 현재 상태

- backend는 PR #506에서 운영 교체 전 preflight가 추가됐다.
- web/race-server는 health endpoint는 있으나 운영 교체 전 preflight가 없고, 교체 후 이미지 일치만 검증한다.

## 계획

- `docker-image.yml` deploy step에 web/race-server용 one-off container preflight 함수를 추가한다.
- web은 `/api/health`, race-server는 `/health`를 host runner에서 컨테이너 IP로 확인한다.
- preflight 실패 시 `docker compose up -d --wait`로 넘어가지 않게 한다.

## 수정 내용

- `docker-image.yml` deploy step에 `preflight_http_service`를 추가했다.
- web 변경 시 새 이미지로 `yeon-web-preflight-${GITHUB_RUN_ID}` 1회성 컨테이너를 띄우고 `/api/health`를 확인한다.
- race-server 변경 시 새 이미지로 `yeon-race-preflight-${GITHUB_RUN_ID}` 1회성 컨테이너를 띄우고 `/health`를 확인한다.
- preflight 실패 또는 컨테이너 조기 종료 시 로그를 출력하고 운영 `docker compose up -d --wait` 단계로 넘어가지 않는다.

## 검증

- `.github/workflows/docker-image.yml` YAML 파싱 성공
- Docker deploy step shell syntax 확인 성공
- `git diff --check` 성공
- `actionlint`는 로컬에 설치되어 있지 않아 실행하지 못함
