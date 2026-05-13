# 작업 로그: 커밋 시 lint/typecheck/build 선처리 + PR 게이트 최소화

## 시작

- 작업자: codex
- 브랜치: chore/pre-commit-ltc-local
- 시작: 2026-05-13

## 진행

- [x] `.githooks/pre-commit`에서 `pnpm --filter @yeon/web build` 실행 추가.
- [x] 기존 SSOT/sync-skills 점검 순서를 유지.
- [x] PR/CI 게이트 관련 운영 방침을 `docs/product/backlog/pre-commit-web-ltc-local.md`에 기록.

## 검증

- 문서 작성 완료
- 훅 수정 후 커밋 전검증 스크립트 반영
