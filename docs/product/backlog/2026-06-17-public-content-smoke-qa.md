# 공개 콘텐츠 SEO 스모크 QA

## 1차

### 작업내용

- `support.yeon.world`, `news.yeon.world`, `blog.yeon.world` 공개 콘텐츠 채널이 실제 Next 라우트에서 로그인으로 튕기지 않는지 검증한다.
- 홈 3개와 대표 글 3개의 canonical, meta description, JSON-LD 타입을 Playwright로 확인한다.
- Host 헤더 기반 rewrite, `robots.txt`, `sitemap.xml` 응답이 각 공개 콘텐츠 canonical host 기준으로 나오는지 확인한다.

### 논의 필요

- 향후 모든 글 URL을 Playwright에서 전수 점검할지, sitemap 단위 테스트와 대표 URL smoke를 병행할지 결정해야 한다.

### 선택지

- A. 대표 URL smoke와 기존 sitemap/robots 단위 테스트를 병행한다.
- B. 모든 공개 콘텐츠 글을 Playwright에서 전수 방문한다.
- C. 운영 배포 뒤 Search Console API 결과만 확인한다.

### 추천

- A. 공개 콘텐츠 글이 늘어날수록 전수 브라우저 테스트는 느려지므로, routing/metadata/host rewrite는 대표 URL로 검증하고 전체 URL 목록은 sitemap 단위 테스트가 맡게 한다.

### 사용자 방향

- 추천 기준으로 진행한다. 현재 단계에서는 콘텐츠 본문 수정/삭제 admin 기능보다 공개 URL과 SEO 노출 경로가 깨지지 않는지 자동 검증하는 것을 우선한다.

## 2차

### 작업내용

- 기존 `public-content-smoke.spec.ts`에 키보드 포커스 이동, 색 대비, 이미지 크기 제한 검증을 추가한다.
- 공개 콘텐츠 HTML이 admin toolbar와 draft URL을 노출하지 않는지 대표 페이지에서 고정한다.
- 공개 콘텐츠 block view가 사용자 입력 문자열을 HTML로 실행하지 않는지 테스트한다.
- public content Spring client가 공개 API 조회에도 `no-store` cache 정책을 쓰는지 테스트한다.
- 500단계 계획 17차 401~425의 완료 상태를 갱신한다.

### 논의 필요

- 모든 공개 글에 Playwright를 전수 적용할지, 대표 페이지와 sitemap 기반 smoke를 병행할지.

### 선택지

- A. 대표 페이지 Playwright smoke와 sitemap URL 검증을 유지한다.
- B. 모든 공개 글을 브라우저에서 전수 방문한다.
- C. 운영 배포 뒤 Search Console과 GA4 수동 확인으로만 둔다.

### 추천

A를 추천한다. 현재 공개 글은 계속 늘어나므로 브라우저 전수 방문보다 대표 URL과 sitemap URL 검증을 조합하는 편이 빠르고 유지보수 가능하다.

### 사용자 방향

사용자 방향이 비어 있으면 추천 기준으로 진행한다.

### 결과

- 공개 콘텐츠 Playwright smoke가 홈/대표 글/host rewrite/robots/sitemap/canonical/metadata/JSON-LD/mobile width/keyboard focus/color contrast/image loading/GA4 CTA를 검증한다.
- JSON-LD `@graph` 구조를 smoke test에서 정상적으로 펼쳐 검증하게 했다.
- `news.yeon.world/news`와 `news.yeon.world/news/<topic>`이 sitemap에서 redirect URL로 남지 않도록 subdomain routing 예외를 고정했다.
- 공개 콘텐츠 보조 텍스트 대비를 `#555` 기준으로 올려 axe color-contrast smoke를 통과시켰다.
- 공개 콘텐츠 렌더 경로에 raw HTML sink가 들어오지 않도록 HTML injection guard test를 추가했다.
- public content Spring client의 공개/관리 조회가 `no-store` cache policy를 유지하는지 테스트했다.
