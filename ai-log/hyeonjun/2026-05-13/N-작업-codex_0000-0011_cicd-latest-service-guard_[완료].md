# CI/CD 최신 서비스 보장 보강

## 목표

- Docker workflow 종료 시 최신 main 기준 web/backend/race-server 배포와 mobile 검증 상태가 거짓 성공으로 남지 않게 한다.
- 매번 4개 전체를 무조건 돌리지 않고 변경된 영역만 처리한다.

## 진행

- 백로그 작성: `docs/product/backlog/cicd-latest-service-guard-20260512.md`
- `.github/workflows/docker-image.yml` 변경 중
  - stale main run 자체 cancel
  - 마지막 성공 Docker run 대신 SemVer Release tag 기준 누적 diff 사용
  - mobile 변경 감지 및 typecheck job 추가
  - 배포 후 변경 서비스 이미지 태그 검증 추가
  - 최종 completion invariant job 추가

## 검증 예정

- YAML parse
- git diff --check
- bash bin/sync-skills.sh --check
- bash bin/verify-ssot.sh --project-only

## 완료

- stale main run이 성공으로 남지 않도록 자체 cancel 요청 추가.
- 변경 범위 기준을 마지막 성공 Docker run에서 마지막 SemVer 운영 릴리즈 태그로 변경.
- mobile 변경 감지 + `pnpm --filter @yeon/mobile typecheck` 검증 job 추가.
- Docker 배포 후 변경 서비스 컨테이너 이미지가 `sha-${GITHUB_SHA::7}`인지 검증.
- 최종 invariant job으로 최신 main 여부, 변경 서비스 build/typecheck/deploy 결과를 검증.

## 검증 결과

- `ruby -e 'require "yaml"; YAML.load_file(".github/workflows/docker-image.yml"); puts "YAML OK"'`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only` (main worktree에서 실행)
- `pnpm install --frozen-lockfile`
- `pnpm --filter @yeon/mobile typecheck`
