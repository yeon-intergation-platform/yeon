# Docker stale main 배포 자동 보정

- 시작: 2026-05-12 22:50 KST
- 목적: 최신 main이 아닌 deploy run이 스킵될 때, 최신 main 기준 Docker 배포 run을 자동 재실행해 운영 결과 불일치를 예방한다.
- 범위: `.github/workflows/docker-image.yml`, 백로그/작업 로그
- 결정: 대규모 workflow split은 별도 PR로 미루고, 이번 PR은 stale deploy 자동 dispatch 보정만 적용한다.
- 검증 예정: `git diff --check`, `bash bin/sync-skills.sh --check`, `bash bin/verify-ssot.sh --project-only`

## 결과

- stale `deploy_production` run이 최신 main 불일치로 스킵될 때 최신 main Docker run 존재 여부를 확인한다.
- 최신 main run이 없으면 `workflow_dispatch`로 자동 보정 배포를 예약한다.
- `jq` 의존성 없이 `curl`/`grep`만 사용해 self-hosted deploy runner 의존성 증가를 피했다.

## 검증

- `bash -n` 동등 스크립트 구문 검증 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 실행: git worktree의 `.git` 파일 구조 때문에 프로젝트 검사는 스킵됨(스크립트 한계), 전역 SSOT OK
