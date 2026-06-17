# 10-작업-codex_1420-1423_news-blog콘텐츠팩

## 범위

- 브랜치: `feat/news-blog-content-pack-20260617`
- 목적: 500단계 계획 15차의 news/blog 초기 콘텐츠를 확장한다.
- 제외: 상담관리/상담 워크스페이스. 동결 정책에 따라 신규 콘텐츠 대상으로 삼지 않는다.

## 코드/문서 근거

- `docs/seo/public-content-channel-policy.md`
- `docs/product/backlog/2026-06-17-public-content-network-500-step-plan.md`
- `apps/web/src/features/public-content/public-content-data.ts`
- `apps/web/src/lib/platform-services.ts`
- `apps/web/src/lib/subdomain-routing.ts`
- `apps/web/src/lib/seo.ts`
- `/Users/osuma/coding_stuffs/discord-assitant/docs/FAQ.md`
- `/Users/osuma/coding_stuffs/discord-assitant/docs/NEXA_SAFETY_POLICY.md`

## 변경 예정

- `apps/web/src/features/public-content/public-content-data.ts`에 news 5개, blog 4개 추가
- `apps/web/src/features/public-content/public-content-admin-model.test.ts`의 article count 갱신
- `docs/product/backlog/2026-06-17-news-blog-content-pack.md` 추가

## 결과

- news 글 5개 추가
  - `notice/support-open`
  - `notice/news-operation-principles`
  - `notice/blog-operation-principles`
  - `updates/card/support-guides`
  - `updates/community/support-guides`
- blog 글 4개 추가
  - `product/nexa-discord-server-operator-design`
  - `engineering/typing-realtime-server-needed`
  - `product/why-card-guest-mode-matters`
  - `product/why-community-starts-small`
- 공개 콘텐츠 article count: 24 → 33
- 상담관리/상담 워크스페이스는 변경하지 않음

## 검증

- `pnpm --dir apps/web exec vitest run src/features/public-content/public-content-admin-model.test.ts src/lib/__tests__/seo.test.ts`
  - 2 files, 12 tests passed
- `pnpm --filter @yeon/web typecheck`
  - passed
- `pnpm --filter @yeon/web lint`
  - passed
- `pnpm --filter @yeon/web build`
  - passed
  - `/news/[...slug]`: 기존 표시 3개 + 5개 추가 경로
  - `/blog/[...slug]`: 기존 표시 3개 + 4개 추가 경로
- `git diff --check`
  - passed
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
  - passed
- `bash bin/verify-ssot.sh --project-only`
  - 루트 main 워크트리에서 passed
