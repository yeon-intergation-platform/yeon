# News와 Blog 초기 콘텐츠

상위 계획: `docs/product/backlog/2026-06-17-public-content-network-500-step-plan.md` 15차 351~375
범위: news/blog 초기 공개 글 보강, draft 후보 목록, 내부 링크와 품질 검증

## 1차

### 작업내용

1. 이미 공개된 news/blog 초기 글과 15차 항목의 대응 관계를 확인한다.
2. 누락된 news 공지와 blog 글을 정적 공개 콘텐츠에 추가한다.
3. 나머지 후보는 draft 목록으로 남겨 발행 범위를 과도하게 늘리지 않는다.
4. news 글은 실행 정보 중심, blog 글은 repo 근거 링크 중심으로 작성한다.
5. 초기 news/blog 글끼리 support/news/blog 내부 링크가 이어지는지 테스트한다.

### 논의 필요

- 기존에 이미 공개된 news/blog 글을 유지할지, 정확히 10개만 남기도록 줄일지.
- 내부 공지를 공개 news로 둘지, draft 문서로만 둘지.

### 선택지

- A. 기존 공개 글은 유지하고 누락된 15차 핵심 글만 추가한다.
- B. 10개만 남기고 기존 공개 글 일부를 제거한다.
- C. 누락 글은 전부 draft로만 남긴다.

### 추천

A를 추천한다. 기존 글은 이미 sitemap과 테스트에 포함된 공개 콘텐츠이므로 제거하면 URL 안정성이 떨어진다. 대신 누락된 핵심 글만 추가하고, 추가 후보는 draft 목록에 둔다.

### 사용자 방향

사용자 방향이 비어 있으면 추천 기준으로 진행한다.

### 결과

- 기존 news/blog 공개 글은 유지하고 누락된 핵심 news 2개, blog 3개를 추가했다.
- 추가 발행 후보는 `docs/public-content/drafts/2026-06-17-news-blog-initial-drafts.md`에 draft로 분리했다.
- news/blog 글이 public Yeon 링크를 최소 1개 이상 갖는지 테스트로 고정했다.

### 검증

- `pnpm --filter @yeon/web public-content:audit` 통과: 공개 콘텐츠 61개 글 검사 통과.
- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-data.test.ts src/features/public-content/public-content-structured-data.test.ts src/features/public-content/public-content-news-detail.test.ts src/features/public-content/public-content-news-editorial-quality.test.ts src/features/public-content/public-content-related-articles.test.ts` 통과: 5 files, 25 tests.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web build` 통과: 정적 페이지 249개 생성.
- `git diff --check` 통과.
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과.
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only` 통과.
