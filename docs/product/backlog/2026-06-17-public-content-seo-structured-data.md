# 공개 콘텐츠 SEO와 structured data 보강

상위 계획: `docs/product/backlog/2026-06-17-public-content-network-500-step-plan.md` 12차 276~300
범위: support/news/blog canonical, sitemap, robots, metadata, structured data, Search Console 등록 정책

## 1차

### 작업내용

1. 공개 콘텐츠 canonical host 설정을 SEO SSOT에서 명시적으로 다룬다.
2. host별 sitemap이 해당 host URL만 반환하는 정책을 테스트로 고정한다.
3. robots disallow에 admin, api, auth, preview 경로 제외 정책을 명확히 한다.
4. article metadata에 기본 OG image와 Twitter image를 제공한다.
5. Article, BreadcrumbList, FAQPage, HowTo structured data가 본문과 같은 정보를 말하는지 테스트로 보강한다.
6. Search Console 등록 대상에 support/news/blog가 포함된 상태를 문서와 코드 검증 기준에 반영한다.

### 논의 필요

- 채널별 전용 OG 이미지를 지금 bitmap으로 만들지, 초기에는 루트 OG 이미지를 기본값으로 둘지.
- FAQPage/HowTo structured data를 모든 support 글에 붙일지, 검증 가능한 구조를 가진 글에만 붙일지.

### 선택지

- A. 현 정적 콘텐츠 구조는 유지하고 metadata/robots/test를 보강한다.
- B. 채널별 OG 이미지 생성 route까지 이번 차수에 포함한다.
- C. structured data 생성 규칙을 DB CMS 전환까지 미룬다.

### 추천

A를 추천한다. 12차의 핵심은 색인 가능한 공개 URL의 구조적 신호를 안정화하는 것이며, 이미지 asset 제작과 CMS 전환은 별도 차수로 분리하는 편이 안전하다.

### 사용자 방향

사용자 방향이 비어 있으면 추천 기준으로 진행한다.

## 결과

- `PUBLIC_CONTENT_CANONICAL_URLS`로 support/news/blog canonical host를 SEO 유틸에서 명시적으로 참조한다.
- robots 공통 제외 경로에 `/admin/`, `/api/`, `/auth/`, `/preview/`를 포함한다.
- support/news/blog 채널별 정적 `opengraph-image` route를 추가했다.
- 공개 콘텐츠 home, collection, article metadata는 채널 기본 OG image와 `summary_large_image` Twitter card를 사용한다.
- Article 계열 JSON-LD는 채널 기본 OG image를 함께 제공한다.
- 12차 276~300 항목을 500단계 원장에 완료 표시했다.

## 검증

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-data.test.ts src/features/public-content/public-content-structured-data.test.ts src/lib/__tests__/seo.test.ts`
- `pnpm --filter @yeon/web public-content:audit`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`
