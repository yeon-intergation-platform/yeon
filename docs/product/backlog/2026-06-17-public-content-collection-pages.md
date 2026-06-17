# 공개 콘텐츠 collection 페이지

## 1차

### 작업내용

- `support`, `news`, `blog`의 중간 탐색 URL을 색인 가능한 collection 페이지로 만든다.
- `/support/nexa`, `/support/nexa/guides`, `/news/updates`, `/news/updates/nexa`, `/blog/engineering`처럼 글 목록을 모으는 URL을 제공한다.
- 비어 있는 분류 URL은 만들지 않고, 실제 article registry에서 글이 있는 collection만 static params와 sitemap에 포함한다.

### 논의 필요

- 향후 DB/CMS로 옮겼을 때 collection URL을 저장값으로 관리할지, 현재처럼 article registry에서 파생할지 결정해야 한다.

### 선택지

- A. article registry에서 비어 있지 않은 collection만 파생한다.
- B. 모든 계획상 분류를 빈 페이지까지 미리 만든다.
- C. 별도 collection registry를 수동으로 만든다.

### 추천

- A. 초기 SEO에서는 빈 페이지가 가장 위험하므로, 실제 글이 있는 collection만 파생하고 sitemap에도 같은 기준으로 넣는다.

### 사용자 방향

- 추천 기준으로 진행한다. 사용자가 말한 `support/news/blog` 분리 구조는 유지하되, 내용 없는 하위 분류는 아직 공개하지 않는다.
