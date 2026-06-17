# support 홈 주요 문제 진입 개선

## 목표

- 공개 콘텐츠 500단계 계획의 176번을 진행해 `support.yeon.world` 홈 첫 화면 아래에 주요 문제 진입 경로를 추가한다.

## 변경

- support 홈 주요 문제 entry helper와 테스트를 추가한다.
- support 홈에 실제 공개 support 글로 이동하는 카드형 바로가기 영역을 추가한다.
- 공개 콘텐츠 링크 추적 kind에 `support_problem_entry`를 추가한다.

## 검증

- 통과: `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-support-home.test.ts`
- 통과: `pnpm --filter @yeon/web public-content:audit`
- 통과: `pnpm --filter @yeon/web typecheck`
- 통과: `pnpm --filter @yeon/web lint`
- 통과: `pnpm --filter @yeon/web build`
- 통과: `git diff --check`
- 통과: `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- 통과: `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`
- 통과: Playwright `/support` desktop 1440px, mobile 390px 렌더링 확인. 두 viewport 모두 가로 overflow 없음.
