# 공개 콘텐츠 import workflow

- 시작: 19:56
- 작업 워크트리: `yeon-2`
- 브랜치: `feat/public-content-import-workflow-20260617`
- 목표: 공개 콘텐츠 500단계 16차 376~400을 구현한다.
- 범위: 원고 frontmatter contract, dry-run 결과 집계, admin import 체크리스트, import workflow 문서.
- 검증 예정: public-content import dry-run, contract/admin 관련 테스트, api-contract/web typecheck, web lint/build, SSOT 검사.

## 결과

- 원고 frontmatter contract schema를 `@yeon/api-contract/public-content`에 추가했다.
- dry-run import가 contract schema를 사용하고 생성/수정/건너뜀 수를 출력하게 했다.
- admin 운영 체크리스트에 `Markdown import dry-run` 항목을 추가했다.
- import workflow 상세 문서와 작성자용 포인터 문서를 갱신했다.
- 500단계 계획의 376~400을 완료 상태로 갱신했다.

## 검증

- `pnpm --filter @yeon/web public-content:import:dry-run` 통과: 원고 1개, 수정 후보 1개, 실패 0개.
- `pnpm --filter @yeon/api-contract test -- public-content.test.ts` 통과: 4 files, 60 tests.
- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-admin-model.test.ts` 통과: 1 file, 7 tests.
- `pnpm --filter @yeon/api-contract typecheck` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/mobile typecheck` 통과.
- `pnpm --filter @yeon/api-client typecheck` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/api-contract lint` 통과.
- `pnpm --filter @yeon/web build` 통과: 249개 정적 페이지 생성.
- `pnpm --filter @yeon/web public-content:audit` 통과: 61개 글 검사 통과.
- `git diff --check` 통과.
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과.
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only` 통과.

- 종료: 20:01
