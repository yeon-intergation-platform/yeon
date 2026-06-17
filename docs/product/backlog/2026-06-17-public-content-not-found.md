# 공개 콘텐츠 404 이동 경로

작성일: 2026-06-17  
대상: `support.yeon.world`, `news.yeon.world`, `blog.yeon.world`  
상위 계획: `docs/product/backlog/2026-06-17-public-content-network-500-step-plan.md`

## 배경

공개 콘텐츠 7차 계획의 175번은 404 페이지에서 관련 글 또는 channel 홈으로 이동할 수 있게 하는 것이다. 현재 존재하지 않는 공개 콘텐츠 URL은 기본 not-found 흐름으로 떨어지며, 사용자가 같은 channel 안에서 계속 탐색할 수 있는 링크가 명확하지 않다.

## 1차

### 작업내용

- support/news/blog channel별 not-found route를 추가한다.
- not-found 화면에서 channel 홈 링크를 제공한다.
- not-found 화면에서 해당 channel의 최신 글 3개를 제공한다.
- 최근 글 선택 로직은 순수 함수로 분리하고 테스트한다.

### 논의 필요

404에서 검색 UI까지 제공할지 여부.

### 선택지

- 홈/최근 글 링크만 제공한다.
- channel 내 검색 UI까지 제공한다.
- 전체 사이트 검색으로 연결한다.

### 추천

초기에는 홈/최근 글 링크만 제공한다. 검색 UI는 support 홈 검색 또는 전체 공개 콘텐츠 검색 차수에서 별도로 다룬다.

### 사용자 방향

비어 있으면 추천 기준으로 진행한다.
