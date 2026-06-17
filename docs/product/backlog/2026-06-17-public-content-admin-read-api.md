# 공개 콘텐츠 admin 읽기 API

범위: Spring public-content admin read API, 공개 콘텐츠 정책 정합성 문서

## 1차

### 작업내용

- `news.yeon.world`, `blog.yeon.world`, `support.yeon.world` 역할 분리를 최종 정책으로 다시 고정한다.
- 1차 admin 범위를 본문 수정/삭제가 아닌 읽기 전용 운영 관제로 명시한다.
- Spring에 `/api/v1/admin/content` 목록 조회와 `/api/v1/admin/content/{articleId}` 상세 조회를 추가한다.
- admin 조회에는 `status`, `visibility`, `noindex`, source 메타데이터를 포함한다.
- 공개 public API의 색인 조건은 기존처럼 `published + public + noindex=false`로 유지한다.

### 논의 필요

- 이후 본문 편집을 공개 페이지 관리자 모드로 둘지, 별도 CMS로 둘지 결정해야 한다.

### 선택지

- A. 지금은 admin 읽기 API만 만들고 수정/삭제/발행은 만들지 않는다.
- B. admin에 create/update/publish/archive까지 한 번에 추가한다.
- C. 정적 registry만 유지하고 Spring admin API를 보류한다.

### 추천

- A. 사용자가 합의한 현재 단계와 맞고, Search Console/sitemap/발행 상태 관제에 필요한 최소 surface만 제공한다.

### 사용자 방향

- 추천 기준으로 진행한다. 현재 admin은 읽기 전용 관제이며, 수정/삭제 UI와 API는 별도 명시 요청 전까지 만들지 않는다.
