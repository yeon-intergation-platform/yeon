# 공개 콘텐츠 운영 확인 모드

상위 계획: `docs/product/backlog/2026-06-17-public-content-network-500-step-plan.md` 11차 251~275
범위: 공개 article detail의 관리자 전용 확인 toolbar, SEO/sitemap 확인 링크, 읽기 전용 preview 정책

## 1차

### 작업내용

1. `?ops=1` 운영 확인 모드에서만 관리자 세션을 확인한다.
2. 관리자 세션이 확인된 경우에만 공개 article detail toolbar를 렌더링한다.
3. toolbar에는 draft/preview 보기, SEO 검사, sitemap 링크와 sitemap 포함 여부를 표시한다.
4. 수정, 저장, 발행, archive, delete UI/action은 만들지 않는다.
5. 운영 확인 모드는 noindex 메타데이터를 사용한다.
6. 공개 사용자 기본 HTML에는 toolbar markup을 포함하지 않는다.

### 논의 필요

- 모든 공개 요청에서 admin session을 확인할지, 명시적인 확인 모드에서만 확인할지.
- preview 링크를 별도 CMS route로 둘지, 현재 서버 렌더링 결과의 `?ops=1` 링크로 둘지.

### 선택지

- A. `?ops=1`일 때만 admin session 확인 후 읽기 전용 toolbar를 렌더링한다.
- B. 모든 공개 article detail에서 admin session을 확인한다.
- C. 별도 admin preview route를 새로 만든다.

### 추천

A를 추천한다. 기본 공개 페이지의 정적/SEO 성격을 최대한 보존하면서 관리자만 확인 도구를 볼 수 있다. 편집/CMS는 후속 차수로 남긴다.

### 사용자 방향

사용자 방향이 비어 있으면 추천 기준으로 진행한다.

## 결과

- `?ops=1` 요청에서만 운영 확인 클라이언트가 활성화된다.
- 공개 article detail의 정적 HTML은 유지하고, toolbar 데이터는 관리자 확인 API에서만 읽는다.
- 비관리자는 API가 `204`를 반환하므로 공개 페이지와 `?ops=1` 페이지 모두 toolbar를 보지 못한다.
- 운영 확인 모드는 `X-Robots-Tag: noindex, nofollow`와 client robots meta를 사용한다.
- toolbar action은 preview, SEO 검사, sitemap 확인만 제공하며 수정, 저장, 발행, archive, delete action은 만들지 않았다.
- `/blog/[...slug]`, `/news/[...slug]`, `/support/[...slug]`는 production build에서 계속 SSG로 남는다.

## 검증

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-ops-toolbar.test.ts src/app/api/v1/public-content/ops-toolbar/__tests__/route.test.ts src/features/public-content/public-content-blog-detail.test.ts src/features/public-content/public-content-table-of-contents.test.ts`
- `pnpm --filter @yeon/web public-content:audit`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- Playwright production check: public page `200`, article text present, toolbar `0`, robots meta `0`; `?ops=1` page `200`, article text present, toolbar `0` for no-admin, `X-Robots-Tag: noindex, nofollow`, client robots meta `noindex,nofollow`, horizontal overflow 없음; no-admin API `204`.
