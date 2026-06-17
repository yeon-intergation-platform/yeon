# 공개 콘텐츠 외부 링크 rel 정책

작성일: 2026-06-17  
대상: `support.yeon.world`, `news.yeon.world`, `blog.yeon.world`  
상위 계획: `docs/product/backlog/2026-06-17-public-content-network-500-step-plan.md`

## 배경

공개 콘텐츠 7차 계획의 167번은 외부 링크 `rel` 정책을 요구한다. 공개 콘텐츠는 support/news/blog에서 서로 연결되고, NEXA 설치 페이지나 제품 도메인 같은 absolute URL도 사용한다. 링크 보안 정책이 컴포넌트마다 흩어지면 누락될 수 있으므로 공용 링크 컴포넌트에서 처리한다.

## 1차

### 작업내용

- 공개 콘텐츠 링크의 `rel` 값을 계산하는 순수 함수를 둔다.
- absolute `http`/`https` 링크에는 기본 `noopener`를 적용한다.
- `target="_blank"` 링크에는 기본 `noopener noreferrer`를 적용한다.
- 호출자가 명시한 `rel`은 덮어쓰지 않는다.
- `PublicContentTrackedLink`가 이 정책을 통과하도록 연결한다.

### 논의 필요

외부 제품 도메인과 외부 제3자 도메인에 서로 다른 `rel` 정책을 둘지 여부.

### 선택지

- 단일 기본 정책: absolute URL에는 `noopener`, 새 탭에는 `noopener noreferrer`.
- 제3자 도메인만 `noreferrer` 적용.
- 링크마다 수동 지정.

### 추천

단일 기본 정책. 초기 공개 콘텐츠에서는 링크 종류가 많지 않고, 수동 지정은 누락 위험이 크다.

### 사용자 방향

비어 있으면 추천 기준으로 진행한다.
