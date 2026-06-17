# Google Search Console 운영 가이드

## 목적

- `https://yeon.world`는 루트 포털 canonical/indexable host로 유지한다.
- 공개 서비스는 각 subdomain을 canonical/indexable host로 유지한다.
- 운영 sitemap은 host별로 분리해 제출한다.
- 인증 워크스페이스, 토큰 URL, mockdata, auth error, redirect-only 경로가 검색에 섞이지 않게 운영 기준을 맞춘다.

## Canonical 원칙

- 루트 검색 기준 URL: `https://yeon.world`
- 타자 서비스 검색 기준 URL: `https://typing.yeon.world`
- 카드 서비스 검색 기준 URL: `https://card.yeon.world`
- 커뮤니티 검색 기준 URL: `https://community.yeon.world`
- `www.yeon.world`: `yeon.world`로 301 redirect
- `dev.yeon.world`: noindex, 운영 sitemap 제외

## 현재 공개 SEO 대상

- `/`
- `https://typing.yeon.world/`
- `https://typing.yeon.world/rooms`
- `https://typing.yeon.world/decks`
- `https://card.yeon.world/`
- `https://community.yeon.world/`
- `/privacy`
- `/terms`
- 향후 `/services/<slug>`
- 향후 `/guides/<slug>`

## 현재 검색 제외 대상

- `/counseling-service`
- `/check/[token]`
- `/auth/error`
- `/landing`
- `/contest`
- `/mockdata/*`
- `/api/*`

## slug 규칙

- 공개 SEO slug는 영문 소문자 kebab-case만 사용한다.
- 서비스 소개와 가이드/아티클은 아래처럼 분리하는 것을 기본값으로 본다.
  - `/services/<slug>`
  - `/guides/<slug>`

## Search Console 등록 순서

1. 가능하면 `sc-domain:yeon.world` Domain property를 먼저 등록해 subdomain 전체 진단을 한 곳에서 본다.
2. 제출 상태를 host별로 보기 위해 아래 URL-prefix property도 등록한다.
   - `https://yeon.world/`
   - `https://typing.yeon.world/`
   - `https://card.yeon.world/`
   - `https://community.yeon.world/`
3. HTML meta verification 방식을 쓰면 Search Console에서 발급한 값을 `GOOGLE_SITE_VERIFICATION` 환경변수에 넣는다.
4. 운영 배포 후 아래 sitemap을 각 URL-prefix property에 제출한다.
   - `https://yeon.world/sitemap.xml`
   - `https://typing.yeon.world/sitemap.xml`
   - `https://card.yeon.world/sitemap.xml`
   - `https://community.yeon.world/sitemap.xml`
5. `URL 검사`에서 `/`, `https://typing.yeon.world/`, `https://typing.yeon.world/rooms`, `https://card.yeon.world/`, `https://community.yeon.world/`, `/privacy`, `/terms`가 자기 canonical host로 잡히는지 확인한다.
6. `/counseling-service`, `/check/<token>`, `/auth/error`, `/mockdata/...`, `dev.yeon.world/*`가 noindex 또는 비제출 대상으로 보이는지 확인한다.

## Google API 자동화 기준

- Search Console API:
  - 사이트 목록 조회: `GET https://www.googleapis.com/webmasters/v3/sites`
  - 속성 추가: `PUT https://www.googleapis.com/webmasters/v3/sites/{siteUrl}`
  - 사이트맵 제출: `PUT https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/sitemaps/{feedpath}`
  - 필요 scope: `https://www.googleapis.com/auth/webmasters`
- Site Verification API:
  - 검증 토큰 발급: `POST https://www.googleapis.com/siteVerification/v1/token`
  - 검증 실행: `POST https://www.googleapis.com/siteVerification/v1/webResource?verificationMethod={method}`
  - 필요 scope: `https://www.googleapis.com/auth/siteverification`
- 권장 자동화 순서:
  1. Domain property는 `DNS_TXT` 토큰을 발급받아 Cloudflare DNS에 TXT로 넣고 verify한다.
  2. URL-prefix property는 이미 GA/GTM 권한이 있으면 `ANALYTICS` 또는 `TAG_MANAGER` 검증을 쓸 수 있다.
  3. GTM 검증은 URL-prefix property에서만 가능하며, 같은 Google 계정이 해당 GTM container의 Publish 또는 Admin 권한을 가져야 한다.
  4. 현재 앱은 GA4 `gtag.js`를 직접 삽입하고 있으며 GTM container snippet은 없다. GTM API로 새 container를 만들 수는 있지만, Search Console 검증 수단으로 쓰려면 앱에 GTM snippet 배포와 container publish가 추가로 필요하다.
  5. 검증 후 `sites.add`로 property를 추가하고 host별 sitemap을 제출한다.

## 환경변수

- 운영: `NEXT_PUBLIC_APP_URL=https://yeon.world`
- 개발: `NEXT_PUBLIC_APP_URL=https://dev.yeon.world`
- 검증 메타: `GOOGLE_SITE_VERIFICATION=<Search Console value>`

## 코드 기준 source of truth

- SEO 유틸: `apps/web/src/lib/seo.ts`
- 루트 metadata: `apps/web/src/app/layout.tsx`
- sitemap: `apps/web/src/app/sitemap.ts`
- robots: `apps/web/src/app/robots.ts`
- 호스트 redirect / dev noindex 헤더: `apps/web/src/proxy.ts`

## 운영 체크리스트

- [ ] `www.yeon.world/*` 접속 시 `https://yeon.world/*`로 308/301 redirect 된다.
- [ ] `dev.yeon.world/robots.txt`는 전체 disallow 또는 noindex 정책을 반영한다.
- [ ] 운영 `robots.txt`는 `/counseling-service`, `/check/`, `/auth/`, `/mockdata/`, `/api/`를 제외한다.
- [ ] host별 `sitemap.xml`에는 해당 host canonical URL만 포함한다.
- [ ] 운영 canonical은 최종 출력 기준으로 루트는 `https://yeon.world/...`, 서비스는 각 canonical subdomain으로 정렬된다.
