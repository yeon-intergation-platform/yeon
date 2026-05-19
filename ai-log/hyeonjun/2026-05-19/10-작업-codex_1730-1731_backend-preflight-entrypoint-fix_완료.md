# 10-작업-codex*1730-1731_backend-preflight-entrypoint-fix*완료

## 목표

- Docker deploy backend preflight의 `/bin/sh: java: not found` 실패를 복구한다.
- 검증 후 PR(main) → merge까지 완료한다.

## 관측한 원인

- 기존 backend preflight는 `docker compose run --entrypoint /bin/sh backend -lc 'java -jar /app/app.jar ...'` 형태였다.
- 이 방식은 backend 이미지의 실제 Java entrypoint를 우회하고, 실행 환경에서 `java`를 찾지 못해 preflight 자체가 실패했다.
- 운영 backend의 `No default constructor` 로그는 이전 깨진 컨테이너 로그이며, 새 이미지 교체 전 preflight가 실패해 기존 컨테이너가 남아 있는 상태다.

## 수정 내용

- backend 전용 shell preflight를 제거했다.
- backend도 `preflight_http_service backend ... 8081 /actuator/health`를 사용해 원래 이미지 명령으로 1회성 컨테이너를 띄운 뒤 health를 확인한다.

## 검증

- `.github/workflows/docker-image.yml` YAML 파싱 성공
- Docker deploy step shell syntax 확인 성공
- `git diff --check` 성공
