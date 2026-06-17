# news/blog 도메인 정책과 news 홈 우선순위

- 시작: 18:28
- 종료: 18:34
- 작업 워크트리: `yeon-4`
- 브랜치: `feat/news-blog-content-policy-20260617`
- 목표: `news.yeon.world` 홈을 notice/updates/news 위계로 바꾸고, `blog.yeon.world` 독립 정책을 공식 문서에 보강한다.
- 상위 계획: `docs/product/backlog/2026-06-17-public-content-network-500-step-plan.md` 9차 201~210 일부, 205~207

## 결과

- `news.yeon.world` 홈을 공식 공지, 제품 업데이트, 업계 뉴스 해설 순서로 표시하도록 news 전용 파생 모델과 view를 추가했다.
- featured 영역은 하나만 두고, 업계 뉴스보다 공지/업데이트를 우선한다.
- news detail 상단에 공지 적용 서비스/적용일, 업데이트 변경 요약/사용자 영향도, 업계 해설 관련 서비스/YEON 관련성을 표시한다.
- `docs/seo/public-content-channel-policy.md`에 `blog.yeon.world` 독립 채널과 news/blog 최상위 분류 정책을 보강했다.

## 검증

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-news-home.test.ts src/features/public-content/public-content-data.test.ts`
- `pnpm --filter @yeon/web public-content:audit`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- Playwright: desktop 1440px, mobile 390px에서 `/news`, `/news/updates/card/support-guides`, `/news/news/ai/discord-ai-news-interpretation` overflow 없음, 홈 순서와 detail context 표시 확인
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only` in base `yeon`
