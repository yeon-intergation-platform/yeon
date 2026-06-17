# Search Console SEO 정합성 작업

- 시작: 12:06
- 워크트리: `yeon-3`
- 브랜치: `codex/seo-search-console-20260617`
- 목표: Google Search Console 등록 전 공개 SEO 표면을 점검하고, API 등록에 필요한 정책과 운영 응답의 불일치를 줄인다.
- 확인한 운영 증거:
  - `https://yeon.world/typing-service`는 `https://typing.yeon.world/`로 308 redirect 된다.
  - `https://www.yeon.world/`는 200으로 열려 문서의 apex redirect 정책과 다르다.
  - `https://typing.yeon.world/rooms` canonical이 `https://yeon.world/typing-service/rooms`로 출력되어 subdomain canonical 정책과 다르다.
  - `GOOGLE_SITE_VERIFICATION`, `GOOGLE_APPLICATION_CREDENTIALS`, `gcloud`는 현재 로컬 실행 환경에 없다.
- 수정 계획:
  1. 프록시 host 판단을 forwarded host 기준으로 정리한다.
  2. host별 robots/sitemap을 분리한다.
  3. 공개 subdomain route canonical을 서비스 canonical URL로 통일한다.
  4. Search Console API/검증/사이트맵 제출 문서를 최신 정책으로 갱신한다.
- 완료 내용:
  1. `www.yeon.world` redirect와 `dev.yeon.world` noindex 헤더가 forwarded host 기준으로 동작하도록 프록시 host 판단을 정리했다.
  2. `robots.txt`와 `sitemap.xml`을 request host 기준 동적 route로 바꿔 host별 sitemap만 노출하게 했다.
  3. typing/card/community subdomain 공개 route의 canonical을 서비스 canonical URL로 정리했다.
  4. Search Console API, Site Verification API, GTM 검증 조건을 `docs/seo/google-search-console.md`에 기록했다.
- 검증 결과:
  - `pnpm --filter @yeon/web exec vitest run src/lib/__tests__/seo.test.ts src/lib/__tests__/subdomain-routing.test.ts` 통과.
  - `pnpm --filter @yeon/web lint` 통과.
  - `pnpm --filter @yeon/web typecheck` 통과.
  - `pnpm --filter @yeon/web build` 통과.
  - 로컬 빌드 서버 `http://localhost:3005`에서 Host 헤더 검증:
    - `Host: www.yeon.world /` -> 308 `https://yeon.world/`
    - `Host: dev.yeon.world /` -> `X-Robots-Tag: noindex, nofollow`
    - `Host: dev.yeon.world /robots.txt` -> `Disallow: /`
    - `Host: yeon.world /sitemap.xml` -> 루트, privacy, terms만 포함
    - `Host: typing.yeon.world /sitemap.xml` -> typing canonical URL만 포함
    - `Host: typing.yeon.world /rooms` -> canonical `https://typing.yeon.world/rooms`
- 남은 외부 작업:
  - Google 계정 인증과 Cloudflare DNS/API 권한이 현재 로컬 환경에 없어 Search Console 실제 property 등록과 검증은 실행하지 못했다.
