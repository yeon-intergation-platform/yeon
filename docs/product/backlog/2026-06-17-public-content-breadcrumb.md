# 공개 콘텐츠 breadcrumb 공용화

## 1차

### 작업내용

- 공개 콘텐츠 article과 collection detail에서 같은 breadcrumb builder를 사용한다.
- 화면 breadcrumb와 `BreadcrumbList` structured data가 같은 경로 순서를 따르게 한다.
- 현재 페이지 항목은 링크가 아닌 `aria-current="page"` 텍스트로 렌더링한다.

### 논의 필요

- breadcrumb label을 collection title처럼 긴 이름으로 쓸지, 서비스/분류 label처럼 짧은 이름으로 쓸지 결정해야 한다.

### 선택지

- A. `Support / NEXA / FAQ / 글 제목`처럼 짧은 경로 label을 사용한다.
- B. `Support / NEXA 도움말 / NEXA FAQ / 글 제목`처럼 collection title을 사용한다.
- C. article detail은 channel만 유지하고 collection page만 breadcrumb를 확장한다.

### 추천

- A. 화면 폭과 구조화 데이터 일관성을 고려하면 짧은 경로 label이 읽기 쉽고, 기존 structured data 기대값도 유지된다.

### 사용자 방향

- 비어 있으면 추천 기준으로 진행한다.
