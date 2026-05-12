# deploy 선택 서비스 이미지 태그 가드

## 상태

- 완료

## 배경

- GitHub Actions에서 일부 서비스만 빌드/publish된 커밋을 배포할 때, 변경되지 않은 서비스까지 현재 SHA 이미지로 pull하면 `image not found`가 발생한다.
- 운영 배포는 이미 변경 서비스 SHA / 미변경 서비스 latest 분기가 들어와 있으나, develop 배포에는 동일한 가드가 남아 있지 않았다.

## 변경

- `.github/workflows/docker-image.yml`의 `deploy_develop` 이미지 env 생성 로직을 서비스별 조건 분기로 변경했다.
  - 변경된 서비스: `sha-${GITHUB_SHA::7}`
  - 변경되지 않은 서비스: `latest`
- `deploy_develop`/`deploy_production` 모두 실제 선택된 web/backend/race 이미지 값을 로그로 출력한다.
- 백로그 2차에 develop 배포 보강 근거를 기록했다.

## 검증

- `ruby -e 'require "yaml"; ... YAML.load_file(".github/workflows/docker-image.yml") ...'`
- `git diff --check`
- `bash bin/verify-ssot.sh --project-only`
- `actionlint .github/workflows/docker-image.yml`는 로컬에 actionlint가 없어 실행하지 못함.
