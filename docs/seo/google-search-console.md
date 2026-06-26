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
- 공개 도움말 검색 기준 URL: `https://support.yeon.world`
- 공식 소식 검색 기준 URL: `https://news.yeon.world`
- 블로그 검색 기준 URL: `https://blog.yeon.world`
- NEXA Discord AI 검색 기준 URL: `https://discord-ai.yeon.world`
- `www.yeon.world`: `yeon.world`로 301 redirect
- `dev.yeon.world`: noindex, 운영 sitemap 제외

## 현재 공개 SEO 대상

- `/`
- `https://typing.yeon.world/`
- `https://typing.yeon.world/rooms`
- `https://typing.yeon.world/decks`
- `https://card.yeon.world/`
- `https://community.yeon.world/`
- `https://support.yeon.world/`
- `https://support.yeon.world/nexa/guides/add-nexa-discord-bot`
- `https://support.yeon.world/nexa/guides/discord-bot-permissions`
- `https://support.yeon.world/typing/getting-started/start-typing-practice`
- `https://support.yeon.world/card/guides/create-flashcard-deck`
- `https://support.yeon.world/community/guides/write-community-post`
- `https://news.yeon.world/`
- `https://news.yeon.world/notice/public-content-network-start`
- `https://blog.yeon.world/`
- `https://blog.yeon.world/product/why-split-support-news-blog`
- `https://discord-ai.yeon.world/`
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
   - `https://game.yeon.world/`
   - `https://support.yeon.world/`
   - `https://news.yeon.world/`
   - `https://blog.yeon.world/`
   - `https://discord-ai.yeon.world/`
3. HTML meta verification 방식을 쓰면 Search Console에서 발급한 값을 `GOOGLE_SITE_VERIFICATION` 환경변수에 넣는다.
4. 운영 배포 후 아래 sitemap을 각 URL-prefix property에 제출한다.
   - `https://yeon.world/sitemap.xml`
   - `https://typing.yeon.world/sitemap.xml`
   - `https://card.yeon.world/sitemap.xml`
   - `https://community.yeon.world/sitemap.xml`
   - `https://game.yeon.world/sitemap.xml`
   - `https://support.yeon.world/sitemap.xml`
   - `https://news.yeon.world/sitemap.xml`
   - `https://blog.yeon.world/sitemap.xml`
   - `https://discord-ai.yeon.world/sitemap.xml`
5. `URL 검사`에서 `/`, `https://typing.yeon.world/`, `https://typing.yeon.world/rooms`, `https://card.yeon.world/`, `https://community.yeon.world/`, `https://game.yeon.world/`, `https://game.yeon.world/snake-io`, `https://support.yeon.world/nexa/guides/add-nexa-discord-bot`, `https://news.yeon.world/notice/public-content-network-start`, `https://blog.yeon.world/product/why-split-support-news-blog`, `https://discord-ai.yeon.world/`, `/privacy`, `/terms`가 자기 canonical host로 잡히는지 확인한다.
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

## sitemap 제출 스크립트

Yeon web workspace에는 Search Console URL-prefix property 추가와 sitemap 제출을 한 번에 처리하는 dry-run 우선 스크립트가 있다.

```bash
pnpm --filter @yeon/web search-console:sitemaps
```

기본 실행은 API를 호출하지 않고 제출 대상만 출력한다. 실제 제출은 Search Console 권한이 있는 Google credential을 준비한 뒤 실행한다.

```bash
GOOGLE_APPLICATION_CREDENTIALS=/safe/path/google-search-console.json \
  pnpm --filter @yeon/web search-console:sitemaps -- --execute
```

필요하면 속성 추가 또는 sitemap 제출을 따로 생략할 수 있다.

```bash
pnpm --filter @yeon/web search-console:sitemaps -- --execute --skip-sites
pnpm --filter @yeon/web search-console:sitemaps -- --execute --skip-sitemaps
```

주의:

- `client_secret_*.json` OAuth 앱 설정 파일만으로는 바로 제출할 수 없다. 사용자가 동의한 `authorized_user` refresh token 파일 또는 Search Console 권한이 부여된 service account credential이 필요하다.
- `discord-ai.yeon.world`는 제출 대상에 포함하지만 sitemap 생성과 canonical 응답은 `discord-assitant` 서비스가 소유한다. 실행 전 `https://discord-ai.yeon.world/sitemap.xml`이 200으로 응답하는지 먼저 확인한다.

## 환경변수

- 운영: `NEXT_PUBLIC_APP_URL=https://yeon.world`
- 개발: `NEXT_PUBLIC_APP_URL=https://dev.yeon.world`
- 검증 메타: `GOOGLE_SITE_VERIFICATION=<Search Console value>`
- Search Console 제출 credential: `GOOGLE_APPLICATION_CREDENTIALS=/safe/path/google-search-console.json`

## 코드 기준 source of truth

- SEO 유틸: `apps/web/src/lib/seo.ts`
- 루트 metadata: `apps/web/src/app/layout.tsx`
- sitemap: `apps/web/src/app/sitemap.ts`
- robots: `apps/web/src/app/robots.ts`
- 호스트 redirect / dev noindex 헤더: `apps/web/src/proxy.ts`
- sitemap 제출 스크립트: `apps/web/scripts/submit-search-console-sitemaps.mjs`

## 공개 콘텐츠 운영 지표 절차

초기 운영은 자동 수집보다 수동 확인을 기준으로 한다. Google credential이 준비되기 전까지 `/admin/content`의 운영 확인 링크에서 Search Console, sitemap, robots, GA4를 확인한다.

18차 Search Console 등록/제출 기록 기준:

| 대상                          | 확인 위치                                         | 제출/확인 기준                                                 |
| ----------------------------- | ------------------------------------------------- | -------------------------------------------------------------- |
| `sc-domain:yeon.world`        | Search Console Domain property                    | 전체 subdomain 노출, 색인, sitemap 상태를 유지 확인한다.       |
| `https://support.yeon.world/` | `/admin/content` support 카드 Search Console 링크 | `https://support.yeon.world/sitemap.xml` 제출 상태를 확인한다. |
| `https://news.yeon.world/`    | `/admin/content` news 카드 Search Console 링크    | `https://news.yeon.world/sitemap.xml` 제출 상태를 확인한다.    |
| `https://blog.yeon.world/`    | `/admin/content` blog 카드 Search Console 링크    | `https://blog.yeon.world/sitemap.xml` 제출 상태를 확인한다.    |

verification/credential 관리:

| 값                            | 위치                                                              | 원칙                                                                                                                |
| ----------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Site Verification meta token  | 운영 환경변수 `GOOGLE_SITE_VERIFICATION`                          | Search Console에서 받은 `google-site-verification=...` 값은 repo에 commit하지 않는다.                               |
| Search Console API credential | 안전한 로컬/서버 경로를 가리키는 `GOOGLE_APPLICATION_CREDENTIALS` | credential JSON 내용은 문서, 로그, PR 본문에 노출하지 않는다.                                                       |
| OAuth `client_secret_*.json`  | credential 생성용 원본                                            | 이 파일만으로는 Search Console 제출이 안 되며 authorized user 또는 권한 있는 service account credential이 필요하다. |

`/admin/content` 운영 체크리스트:

1. `Domain property`는 `수동 확인` 상태로 두고 `sc-domain:yeon.world`의 전체 노출, 색인, sitemap 상태를 Search Console에서 확인한다.
2. `URL-prefix properties`는 support/news/blog 채널 카드의 Search Console 링크로 각각 등록 상태를 확인한다.
3. `Sitemap coverage`가 `정상`인지 확인한다. `확인 필요`이면 host별 sitemap에 홈 또는 발행 public 글이 빠진 것이다.
4. `Robots links`가 `정상`인지 확인하고, 필요하면 각 host의 `robots.txt` 링크를 열어 sitemap URL과 disallow 정책을 본다.
5. `GA4 events`에서 측정 ID가 `G-YGRNS3PQBQ`로 표시되는지 확인하고 GA4 report 링크에서 `page_view`, `public_content_cta_click`, `public_content_link_click` 이벤트를 본다.
6. `Host page_view split`에서 support/news/blog host별 `page_view` 분리 확인이 필요한지 본다.
7. `Channel click events`에서 support CTA, news 제품/support 링크, blog 관련 support/source 링크가 추적 대상인지 확인한다.
8. `Weekly Search Console`, `Monthly indexing review`, `Article query tracking` 항목으로 주간/월간 수동 확인 주기를 놓치지 않는다.
9. `SEO warning queue`가 0인지 확인한다. 0이 아니면 noindex, meta description, canonical, sitemap, title 품질 경고를 먼저 처리한다.
10. `Title quality`가 0인지 확인한다. 0이 아니면 [공개 콘텐츠 제목 작성 원칙](./public-content-title-guidelines.md)에 맞게 제목을 다시 쓴다.
11. `Source traceability`가 0보다 큰지 확인한다. 신규 글이 들어왔는데 source path가 없다면 발행 전 근거 경로를 보강한다.
12. `Google API credential gate`는 `GOOGLE_APPLICATION_CREDENTIALS`와 verification token이 준비된 뒤에만 execute 작업으로 넘긴다.
13. `GitHub API polling`은 PR/check/run 상태 확인을 8분 이상 간격으로 유지하는지 확인한다.

주간 Search Console snapshot:

1. Search Console에서 `sc-domain:yeon.world`를 열고 최근 7일 성과를 확인한다.
2. `pnpm --filter @yeon/web public-content:governance-report`를 실행해 repo 기준 SEO/title/source/sitemap 상태를 확인한다.
3. URL-prefix property `https://support.yeon.world/`, `https://news.yeon.world/`, `https://blog.yeon.world/`를 각각 연다.
4. `실적`에서 총 노출수, 클릭수, CTR, 평균 게재순위를 기록한다.
5. `페이지` 탭에서 노출이 생긴 URL 상위 10개를 기록한다.
6. `검색어` 탭에서 support 글 제목 개선에 쓸 수 있는 query를 기록한다.
7. 노출은 있는데 클릭이 낮은 글은 title과 description 개선 후보로 표시한다.
8. 클릭은 있는데 제품 진입이 낮은 support 글은 CTA 문구와 위치를 점검한다.

월간 Search Console 점검:

1. `페이지 색인 생성`에서 색인 제외 페이지가 급증했는지 확인한다.
2. `찾을 수 없음(404)`이 늘었으면 해당 URL의 내부 링크와 redirect 필요성을 확인한다.
3. `대체 페이지(적절한 canonical 태그 있음)` 또는 canonical mismatch가 늘었는지 확인한다.
4. `Sitemaps`에서 `support`, `news`, `blog`, `discord-ai` sitemap 제출 실패가 있는지 확인한다.
5. `robots.txt` 테스트와 실제 `https://<host>/robots.txt` 응답이 같은 정책을 말하는지 확인한다.
6. 오래된 support 글은 실제 서비스 동작과 다른 내용이 없는지 확인한다.

GA4 공개 콘텐츠 확인:

1. GA4 속성에서 측정 ID `G-YGRNS3PQBQ`가 운영 `gtag.js`와 일치하는지 확인한다.
2. `Reports` 또는 `Explore`에서 `page_view`를 host 또는 page path 기준으로 나눈다.
3. `public_content_cta_click` 이벤트를 `channel`, `service`, `category`, `slug` 기준으로 본다.
4. `public_content_link_click` 이벤트를 `link_kind` 기준으로 본다.
5. support 글별 제품 진입은 `public_content_cta_click`을 기준으로 본다.
6. news/blog에서 관련 support 문서로 이동하는 흐름은 `public_content_link_click`과 target URL 기준으로 본다.

GA4 이벤트 의미:

| 이벤트                      | 주요 파라미터                                                       | 운영 판단                                                         |
| --------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `page_view`                 | `page_location`, `page_path`, `page_title`                          | host별 공개 콘텐츠 유입과 탐색량을 분리한다.                      |
| `public_content_cta_click`  | `channel`, `service`, `category`, `slug`, `link_kind`, `target_url` | support 글별 제품 진입 CTA 성과를 본다.                           |
| `public_content_link_click` | `channel`, `service`, `category`, `slug`, `link_kind`, `target_url` | news의 제품/support 연결, blog의 관련 support/source 연결을 본다. |

기록 위치:

- 간단한 주간 snapshot은 `ai-log/hyeonjun/YYYY-MM-DD/`에 운영 메모로 남긴다.
- 반복되는 개선 후보는 `docs/product/backlog/seo.md` 또는 공개 콘텐츠 백로그에 승격한다.
- 자동 Google API 연동은 credential과 verification token이 준비된 뒤 별도 백로그로 진행한다.
- sitemap 제출 실패, 색인 제외 급증, 404 증가, canonical mismatch는 월간 운영 이슈 또는 알림 후보로 남긴다.

## 운영 체크리스트

- [ ] `www.yeon.world/*` 접속 시 `https://yeon.world/*`로 308/301 redirect 된다.
- [ ] `dev.yeon.world/robots.txt`는 전체 disallow 또는 noindex 정책을 반영한다.
- [ ] 운영 `robots.txt`는 `/counseling-service`, `/check/`, `/auth/`, `/mockdata/`, `/api/`를 제외한다.
- [ ] host별 `sitemap.xml`에는 해당 host canonical URL만 포함한다.
- [ ] Search Console URL-prefix property는 `yeon`, `typing`, `card`, `community`, `support`, `news`, `blog`, `discord-ai` 8개를 등록한다.
- [ ] Search Console sitemap은 위 8개 host의 `/sitemap.xml`을 각각 제출한다.
- [ ] 운영 canonical은 최종 출력 기준으로 루트는 `https://yeon.world/...`, 서비스는 각 canonical subdomain으로 정렬된다.
- [ ] `/admin/content`에서 support/news/blog의 Search Console, sitemap, robots 링크가 동작한다.
- [ ] GA4에서 `page_view`, `public_content_cta_click`, `public_content_link_click` 이벤트를 확인한다.
- [ ] GitHub PR/check 상태 확인은 8분 이상 간격 원칙을 유지한다.
