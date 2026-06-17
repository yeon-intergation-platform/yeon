# 공개 콘텐츠 정적 MVP

## 작업 범위

- `support.yeon.world`, `news.yeon.world`, `blog.yeon.world`의 1차 정적 공개 콘텐츠 화면을 추가한다.
- NEXA, typing, card, community 중심의 support 글과 news/blog 초기 글을 registry 기반으로 제공한다.
- host rewrite, canonical, sitemap, robots를 공개 콘텐츠 host까지 확장한다.

## 제외 범위

- Spring DB 기반 CMS
- 본문 수정/삭제 UI
- 상담 워크스페이스 콘텐츠
- mooddesk 공개 콘텐츠 편입

## 진행 상태

- 정적 콘텐츠 registry 추가
- 공개 콘텐츠 홈/detail UI 추가
- `/support`, `/news`, `/blog` route 추가
- subdomain rewrite 확장
- sitemap/robots 확장

## 검증

- `pnpm --filter @yeon/web test -- src/lib/__tests__/seo.test.ts src/lib/__tests__/subdomain-routing.test.ts`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`
- Playwright/Chrome 수동 smoke
  - `http://localhost:3000/support`
  - `http://localhost:3000/support/nexa/guides/add-nexa-discord-bot`
  - `http://localhost:3000/news`
  - `http://localhost:3000/blog/product/why-split-support-news-blog`
- host header smoke
  - `Host: support.yeon.world` article 200 + canonical 확인
  - `Host: support.yeon.world` sitemap에 support URL만 포함 확인
  - `Host: blog.yeon.world` robots host/sitemap 확인
  - `Host: news.yeon.world` legacy `/news/...` prefix canonical redirect 확인
