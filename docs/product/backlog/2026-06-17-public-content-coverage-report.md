# 공개 콘텐츠 Coverage 리포트

작성일: 2026-06-17
상위 계획: `docs/product/backlog/2026-06-17-public-content-network-500-step-plan.md` 21차 후속 운영 자동화
범위: support/news/blog 정책 버킷 coverage report, CLI, 테스트, 운영 문서
제외: 신규 원고 작성, Search Console API 조회, admin 편집 기능

## 1차: Coverage 기준 정의

논의 필요: coverage 기준을 글 수 절대량으로 볼지, 정책 버킷 존재 여부로 볼지.
선택지: 전체 글 수, 서비스별 최소 1개, 정책 버킷별 최소 1개.
추천: 초기에는 정책 버킷별 최소 1개를 기준으로 하고, 세부 글 수 목표는 후속 콘텐츠 확장에서 다룬다.
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

1. support는 `nexa`, `typing`, `card`, `community`, `account` 서비스가 최소 1개 글을 갖는지 본다.
2. news는 `notice`, `updates`, `news` 분류가 최소 1개 글을 갖는지 본다.
3. blog는 `engineering`, `product`, `devlog`, `essay` 분류가 최소 1개 글을 갖는지 본다.
4. coverage target은 한 파일의 상수로 관리한다.

## 2차: CLI와 테스트

논의 필요: coverage report를 실패 게이트로 둘지 운영 현황판으로 둘지.
선택지: 실패 게이트, 운영 현황판, 둘 다.
추천: 지금은 운영 현황판으로 두고 missing bucket을 명확히 출력한다.
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

1. `buildPublicContentCoverageReport`를 추가한다.
2. Markdown formatter를 추가한다.
3. `public-content:coverage-report` script를 추가한다.
4. 현 registry 기준 covered/missing bucket을 테스트한다.

## 검증 예정

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-coverage-report.test.ts`
- `pnpm --filter @yeon/web public-content:coverage-report`
- `pnpm --filter @yeon/web public-content:audit`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`
