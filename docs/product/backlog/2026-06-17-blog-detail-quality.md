# blog 카드와 상세 품질 정책

상위 계획: `docs/product/backlog/2026-06-17-public-content-network-500-step-plan.md` 10차 233~250
범위: `blog.yeon.world` 카드 메타데이터, 상세 운영 주체, 관련 링크, 목차/타이포그래피 정책

## 1차

### 작업내용

1. blog 카드의 분류, 날짜, 읽는 시간 노출을 테스트로 고정한다.
2. blog 상세에 운영 주체를 보여준다.
3. blog 상세에 관련 support 문서와 news 공지 링크를 둔다.
4. engineering 글은 repo 근거 링크를 제공한다.
5. blog 목차는 긴 engineering 글에만 기본 노출하고 essay는 숨긴다.
6. 이미지 없는 글도 본문 폭과 spacing이 어색하지 않게 조정한다.
7. RSS/feed와 author page 비생성 정책을 테스트로 고정한다.

### 논의 필요

- 관련 support/news 링크를 수동 필드로 둘지, 글의 service/category/sourcePaths에서 파생할지.
- author page를 지금 만들지 않을 경우 상세에서 운영 주체만 표시해도 충분한지.

### 선택지

- A. blog detail model에서 관련 링크와 운영 주체를 파생한다.
- B. article registry에 relatedSupport/relatedNews/author 필드를 추가한다.
- C. 기존 상세 화면을 그대로 두고 문서 정책만 추가한다.

### 추천

A를 추천한다. 초기에는 발행 글 수가 적고 service 기준 연결이 충분하므로 수동 필드를 늘리면 관리 포인트가 먼저 늘어난다.

### 사용자 방향

사용자 방향이 비어 있으면 추천 기준으로 진행한다.

### 결과

- blog 카드 메타 정보를 helper로 분리하고 분류, 날짜, 읽는 시간 표시를 테스트로 고정했다.
- blog 상세에 운영 주체, 관련 support 문서, 관련 공식 news 링크, engineering repo 근거 링크를 추가했다.
- blog 목차는 긴 engineering 글에만 기본 노출하고 essay/product/devlog는 기본 숨김으로 제한했다.
- blog 상세 본문 폭을 support보다 넓은 `max-w-[820px]`로 조정해 이미지 없는 글도 타이포그래피 중심으로 읽히게 했다.
- `/blog/feed.xml` 유지와 author page 비생성 정책을 테스트로 고정했다.

### 검증

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-article-card.test.ts src/features/public-content/public-content-blog-detail.test.ts src/features/public-content/public-content-table-of-contents.test.ts src/features/public-content/public-content-title-quality.test.ts src/features/public-content/public-content-blog-home.test.ts`
- `pnpm --filter @yeon/web public-content:audit`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`
- Playwright `/blog/engineering/nexa-provider-pool-overview`, `/blog/essay/why-support-docs-first` desktop/mobile: 200, 필수 문구 누락 없음, 금지 문구 없음, 가로 overflow 없음
