# support 서비스 카드와 본문 폭 보강

## 목표

- 공개 콘텐츠 500단계 계획의 186~188번을 진행해 support 홈 서비스 진입과 support 글 읽기 폭을 보강한다.

## 변경

- support 홈 서비스 entry helper와 테스트를 추가했다.
- support 홈에서 서비스별 도움말 카드를 모바일 1열, 데스크톱 2~3열로 렌더링한다.
- support article description/body 읽기 폭을 `max-w-[760px]`로 제한했다.

## 검증

- 통과: `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-support-home.test.ts`
- 통과: `pnpm --filter @yeon/web public-content:audit`
- 통과: `pnpm --filter @yeon/web typecheck`
- 통과: `pnpm --filter @yeon/web lint`
- 통과: `pnpm --filter @yeon/web build`
- 통과: `git diff --check`
- 통과: `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- 통과: `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`
- 통과: Playwright `/support` desktop 1440px에서 서비스 카드 3열+2열, mobile 390px에서 1열 확인. 두 viewport 모두 가로 overflow 없음.
- 통과: Playwright `/support/nexa/troubleshooting/bot-not-responding` desktop 1440px에서 본문 폭 760px, mobile 390px에서 viewport 내 342px 확인. 두 viewport 모두 가로 overflow 없음.
