# 공개 콘텐츠 smoke QA 보강

- 시작: 20:04
- 작업 워크트리: `yeon-3`
- 브랜치: `feat/public-content-smoke-qa-20260617`
- 목표: 공개 콘텐츠 500단계 17차 401~425를 구현한다.
- 범위: Playwright smoke 보강, block HTML injection 테스트, public content API cache policy 테스트, 17차 계획 완료 표시.
- 검증 예정: public-content smoke e2e, 관련 vitest, web lint/typecheck/build, SSOT 검사.
- 종료: 20:16

## 결과

- 공개 콘텐츠 Playwright smoke를 23개 테스트로 확장했다.
- sitemap URL 검증 중 발견된 `news.yeon.world/news` category path redirect 충돌을 subdomain routing 예외로 수정했다.
- JSON-LD `@graph` 구조를 smoke test에서 펼쳐 Article/NewsArticle/BlogPosting을 검증하게 했다.
- public-content 보조 텍스트 색상을 `#555` 기준으로 올려 axe color-contrast를 통과시켰다.
- 공개 콘텐츠 raw HTML sink 회귀 방지 테스트와 Spring client `no-store` cache policy 테스트를 추가했다.
- 500단계 계획 17차 401~425를 완료 표시했다.

## 검증

- `pnpm --filter @yeon/web exec vitest run src/lib/__tests__/subdomain-routing.test.ts src/features/public-content/public-content-data.test.ts src/features/public-content/public-content-structured-data.test.ts src/features/public-content/public-content-navigation.test.ts src/features/public-content/public-content-html-injection-guard.test.ts src/server/__tests__/public-content-spring-client.test.ts` 통과: 6 files, 36 tests.
- `pnpm --filter @yeon/web exec playwright test e2e/public-content-smoke.spec.ts --project=chromium` 통과: 23 tests.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web build` 통과: 249 pages.
- `pnpm --filter @yeon/web public-content:audit` 통과: 61개 공개 콘텐츠 글.
- `git diff --check` 통과.
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과.
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only` 통과.
