# 23차 작업 로그 - 공개 콘텐츠 RSS 피드

시작: 2026-06-17 15:59 KST  
종료: 2026-06-17 16:02 KST  
담당: Codex  
브랜치: `feat/public-content-rss-feeds-20260617`

## 목표

- `support/news/blog` 공개 콘텐츠 channel에 RSS 피드를 추가한다.
- `support.yeon.world/feed.xml`, `news.yeon.world/feed.xml`, `blog.yeon.world/feed.xml` 접근이 각각 내부 route로 연결되게 한다.
- 피드는 공개 발행 콘텐츠만 포함한다.

## 결과

- `support`, `news`, `blog` channel별 RSS XML builder를 추가했다.
- `/support/feed.xml`, `/news/feed.xml`, `/blog/feed.xml` route를 추가했다.
- 공개 콘텐츠 subdomain의 `/feed.xml`을 channel 내부 route로 rewrite하게 했다.
- 공개 콘텐츠 홈 metadata에 RSS alternate를 추가했다.

## 검증

- 통과: `pnpm --dir apps/web exec vitest run src/features/public-content/public-content-feed.test.ts src/lib/__tests__/subdomain-routing.test.ts --reporter verbose`
- 통과: `pnpm --filter @yeon/web lint`
- 통과: `pnpm --filter @yeon/web typecheck`
- 통과: `pnpm --filter @yeon/web build`
- 통과: `git diff --check`
- 통과: `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- 통과: `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`
