# CI/CD 누적 diff 선택 배포 작업 로그

## 목표
- 여러 에이전트가 main에 빠르게 머지해도 배포 누락이 없도록 한다.
- 매번 web/backend/race 전체를 배포하지 않고, 마지막 성공 main 배포 SHA부터 현재 SHA까지 누적 diff로 필요한 서비스만 빌드/배포한다.
- CI/배포 안정화 변경이므로 root version을 PATCH bump하고 GitHub Release 기준을 맞춘다.

## 구현
- `docker-image.yml` `detect_changes`에서 main push일 때 GitHub Actions API로 마지막 성공 main push 배포 run의 `head_sha`를 조회한다.
- 조회 성공 시 `last_success_sha..GITHUB_SHA` 누적 diff로 web/backend/race 변경 범위를 판별한다.
- 조회 실패, 기준 커밋 없음, 기준 커밋이 현재 커밋 조상이 아닌 경우는 전체 서비스 배포로 fallback한다.
- `package.json` version을 `0.0.0`에서 `0.0.1`로 bump했다.

## 검증
- Ruby YAML parse: `.github/workflows/*.yml` OK
- `pnpm release:verify -- v0.0.1` OK
- `git diff --check` OK
- `bash bin/sync-skills.sh --check` OK
- `bash bin/verify-ssot.sh --project-only` OK
- GitHub API로 최근 성공 main docker-image run 조회 가능 확인

## 남은 일
- PR 생성, main 머지, docker-image 배포 성공 확인
- `v0.0.1` tag/Release 생성 확인
