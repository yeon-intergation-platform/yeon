# 작업 로그: 커밋 훅에서 build 제거 후 운영/CD 중심 검증으로 전환

## 시작
- 작업자: codex
- 브랜치: chore/pre-commit-ltc-local
- 시작: 2026-05-13 19:01

## 진행
- [x] `ci`/로컬 커밋 훅에서 `pnpm --filter @yeon/web build` 실행 라인을 제거.
- [x] 문서(`docs/product/backlog/pre-commit-web-ltc-local.md`)에 차수 3로 변경 사유/선택지/사용자 방향 기록.
- [x] 이전 로그의 작업 상태에서 build 선처리 변경 포인트 반영(로컬 생산성 기준).

## 검증
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`
- `git diff --check`

## 비고
- 사용자의 요청대로 로컬 커밋 훅은 `lint` + `typecheck`만 실행하도록 유지.
