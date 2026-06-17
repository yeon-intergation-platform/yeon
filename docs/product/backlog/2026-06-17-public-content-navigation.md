# 공개 콘텐츠 서비스/분류 내비게이션

작성일: 2026-06-17  
대상: `support.yeon.world`, `news.yeon.world`, `blog.yeon.world`  
상위 계획: `docs/product/backlog/2026-06-17-public-content-network-500-step-plan.md`

## 배경

공개 콘텐츠 7차 계획의 162번, 163번은 공용 service nav와 category nav를 요구한다. 현재 홈과 collection 화면은 글 목록과 하위 collection 링크를 직접 렌더링하고 있어, channel별 탐색 규칙을 재사용 가능한 source of truth로 보기 어렵다.

## 1차

### 작업내용

- 공개 콘텐츠 collection 데이터에서 서비스 내비게이션 항목을 파생한다.
- 공개 콘텐츠 collection 데이터에서 분류 내비게이션 항목을 파생한다.
- support는 서비스가 1depth이므로 서비스 nav를 홈과 문서 화면에서 사용할 수 있게 한다.
- news/blog는 분류가 1depth이므로 분류 nav를 홈과 collection 화면에서 사용할 수 있게 한다.
- 기존 하위 분류 링크는 공용 category nav 컴포넌트로 대체한다.

### 논의 필요

news/blog에서 서비스별 전체 모음 URL을 새로 만들지 여부.

### 선택지

- 현재 URL 구조 유지: 링크 가능한 collection만 nav에 표시한다.
- 서비스별 가상 collection 추가: `news.yeon.world/nexa` 같은 경로를 추가한다.
- 검색 필터 UI 도입: collection route는 유지하고 화면 필터만 추가한다.

### 추천

현재 URL 구조 유지. `news`, `blog`는 category가 1depth인 정책이 이미 확정되어 있으므로, 서비스별 가상 URL을 성급히 늘리지 않는다.

### 사용자 방향

비어 있으면 추천 기준으로 진행한다.
