# 27-작업-codex_1613-public-content-import-dry-run

## 목표

- 공개 콘텐츠 500단계 계획 중 16차 작성/import/발행 워크플로우를 진전시킨다.
- 운영 DB 쓰기 없이 Markdown 원고 규칙과 dry-run import 검증을 추가한다.

## 범위

- `docs/public-content/articles/` 원고 저장 규칙
- `apps/web/scripts/dry-run-public-content-import.ts`
- `@yeon/web` script 추가
- SEO 운영 문서 연결

## 제외

- 상담 워크스페이스 콘텐츠
- admin 본문 수정/삭제/발행 UI
- 운영 DB 생성/수정/발행 API 호출

## 검증 예정

- `pnpm --filter @yeon/web public-content:import:dry-run`
- `pnpm --filter @yeon/web public-content:audit`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`

## 결과

- `docs/public-content/articles/` 원고 저장 위치와 파일명/frontmatter 규칙을 문서화했다.
- `apps/web/scripts/dry-run-public-content-import.ts`를 추가해 원고 frontmatter, channel/service/category/status, slug, 파일명, 빈 heading, 중복 slug를 검증한다.
- `--mode=draft|publish|all`을 지원해 초안 검수와 발행 후보 검수를 분리했다.
- 운영 DB 쓰기, 발행, 수정, 삭제 기능은 만들지 않았다.

## 검증 결과

- `pnpm --filter @yeon/web public-content:import:dry-run` 통과
- `pnpm --filter @yeon/web public-content:import:dry-run -- --mode=all` 통과
- `pnpm --filter @yeon/web exec eslint scripts/dry-run-public-content-import.ts` 통과
- `pnpm --filter @yeon/web public-content:audit` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`는 linked worktree에서 프로젝트 검사를 건너뛰어 기본 `yeon` 워크트리에서 재실행했고 통과
