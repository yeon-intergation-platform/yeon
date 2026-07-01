# CI/CD Docker buildx 안정화 작업 로그

## 목표

- `Build, Push, and Deploy Docker Image #891` 실패 원인을 근거 기반으로 분리한다.
- self-hosted ARM64 Docker build가 같은 유형으로 다시 실패하지 않도록 workflow를 보강한다.
- 실패하더라도 Actions 로그만으로 디스크, 메모리, buildx cache 상태를 확인할 수 있게 한다.

## 현재 근거

- `Build, Push, and Deploy Docker Image #891`은 실패했고, 같은 커밋의 `Frontend Quality #522`와 `SSOT Check #1492`는 성공했다.
- 실패 job은 `build_web / build_arm64`이며 `docker/build-push-action` 실행 중 실패했다.
- `verify_latest_completion`은 `BUILD_WEB_RESULT=failure`, `DEPLOY_RESULT=skipped` 때문에 실패했다.
- GitHub Actions는 실패한 web build job 로그를 제공하지 못했다.
- 로컬 `NEXT_PUBLIC_RACE_SERVER_URL=wss://race.yeon.world NODE_OPTIONS='--max-old-space-size=4096' pnpm --filter @yeon/web build`는 성공했다.
- 현재 `docker-build-{web,backend,race}.yml`은 local buildx cache를 `cache-from`과 `cache-to`에 같은 디렉터리로 사용한다.
- 과거 buildx cache 안정화 결론은 새 디렉터리에 export하고 `index.json` 검증 후 교체하는 방식이었다.

## 계획

- Docker build workflow 3개에 `BUILDX_LOCAL_CACHE_NEW`를 도입한다.
- cache export는 temp 디렉터리로 보내고, 성공 후 검증 및 교체 step을 추가한다.
- 실패 또는 취소 시 temp cache 디렉터리를 정리한다.
- 각 Docker build job에 pre-build/post-failure runner 진단 로그를 추가한다.
- YAML/diff/SSOT 검증과 웹 production build를 다시 실행한다.

## 진행

- `docker-build-web.yml`, `docker-build-backend.yml`, `docker-build-race.yml`의 local buildx cache export를 기존 cache 디렉터리 직접 덮어쓰기에서 `*-new-${GITHUB_RUN_ID}-${GITHUB_RUN_ATTEMPT}` temp 디렉터리로 변경했다.
- 빌드 성공 후 `index.json`을 확인하고 temp cache를 기존 cache로 교체하는 step을 추가했다.
- 실패 또는 취소 시 디스크, 메모리, Docker 사용량, buildx builder, local cache 크기가 Actions 로그에 남도록 진단 step을 추가했다.
- `docker-image.yml`의 변경 범위 output redirect를 묶어 `actionlint` shellcheck 경고를 제거했다.

## 검증 결과

- `ruby -e "require 'yaml'; Dir['.github/workflows/*.yml'].sort.each { |f| YAML.load_file(f); puts \"ok #{f}\" }"` 통과.
- `actionlint .github/workflows/*.yml` 통과.
- `git diff --check` 통과.
- `bash bin/sync-skills.sh --check` 통과.
- `bash bin/verify-ssot.sh --project-only` 통과.
- `NEXT_PUBLIC_RACE_SERVER_URL=wss://race.yeon.world NODE_OPTIONS='--max-old-space-size=4096' pnpm --filter @yeon/web build` 통과.
