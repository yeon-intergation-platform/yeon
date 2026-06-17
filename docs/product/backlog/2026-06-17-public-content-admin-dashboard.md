# 공개 콘텐츠 관리 대시보드

## 1차

### 작업내용

- `/admin/content`에서 `support`, `news`, `blog` 공개 콘텐츠 채널의 현재 글 수와 SEO 상태를 읽기 전용으로 확인한다.
- 서비스별 글 분포, canonical URL, sitemap 포함 대상, 작성 출처 경로를 한 화면에서 확인할 수 있게 한다.
- `/admin/content/support`, `/admin/content/news`, `/admin/content/blog` 채널별 화면을 제공한다.

### 논의 필요

- 글 본문 수정, 삭제, 예약 발행, 권한 워크플로우는 지금 단계에서 admin에 포함할지 여부.

### 선택지

- A. 읽기 전용 운영 현황판만 만든다.
- B. 글 생성, 수정, 삭제까지 admin에서 처리한다.
- C. 외부 CMS를 붙이고 admin은 링크만 제공한다.

### 추천

- A. 지금 단계에서는 정적 registry 기반으로 공개 콘텐츠를 배포하므로 admin은 운영 현황, SEO 점검, 공개 URL 이동까지만 맡긴다.

### 사용자 방향

- 본문 수정/삭제 기능은 아직 만들지 않는다. 관리자가 `news`, `support`, `blog` 쪽을 직접 접속해서 확인하고, 코드/registry 변경으로 콘텐츠를 운영한다.

## 2차

### 작업내용

- 실제 CMS나 Spring 관리 API가 생기면 작성, 검수, 발행 상태를 추가한다.

### 논의 필요

- 글의 최종 source of truth를 Spring DB, Git registry, 외부 CMS 중 어디에 둘지 결정해야 한다.

### 선택지

- A. Git registry 유지
- B. Spring DB 관리 API 추가
- C. 외부 CMS 연동

### 추천

- 초기 SEO 품질이 안정될 때까지 Git registry를 유지하고, 반복 작성량이 늘어난 뒤 Spring DB 또는 CMS로 옮긴다.

### 사용자 방향

- 비워 둔다. 추천 기준으로 진행한다.
