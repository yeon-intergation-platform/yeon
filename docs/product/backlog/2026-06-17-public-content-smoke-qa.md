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
