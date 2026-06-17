# news 목록 필터와 detail 필수 섹션

상위 계획: `docs/product/backlog/2026-06-17-public-content-network-500-step-plan.md` 9차 211~219
범위: `news.yeon.world` collection 필터, news detail 필수 섹션, 관련 support/blog 링크

## 1차

### 작업내용

1. 공지 목록은 서비스 필터가 보이도록 유지하고 테스트로 고정한다.
2. 업데이트 목록은 서비스 필터가 보이도록 유지하고 테스트로 고정한다.
3. 업계 뉴스 목록은 서비스 필터가 아니라 주제 필터를 제공한다.
4. 공지 detail에는 `무엇이 바뀌었나요`, `사용자에게 영향이 있나요`, `필요한 조치` 섹션을 표시한다.
5. 업데이트 detail에는 `변경 전`, `변경 후`, `관련 support 문서` 섹션을 표시한다.
6. 업계 뉴스 detail에는 관련 blog 글 링크를 표시한다.

### 논의 필요

- 업계 뉴스 2depth를 서비스로 볼지 주제로 볼지.
- 필수 섹션을 본문 registry에 직접 넣을지, article metadata와 category에서 파생해 렌더링할지.

### 선택지

- A. `news/news/{topic}`을 topic collection으로 보고 필수 섹션은 category별 파생 모델에서 렌더링한다.
- B. 기존처럼 `news/{category}/{service}` 패턴을 모든 news category에 강제한다.
- C. 모든 news 글 body에 heading block을 수동으로 추가한다.

### 추천

A를 추천한다. `notice`와 `updates`는 서비스 필터가 맞지만 업계 뉴스 해설은 `ai`, `discord`, `developer`, `product` 같은 주제 필터가 정책에 맞다. 필수 섹션도 렌더링 모델에서 파생하면 기존 글을 반복 수정하지 않고 audit로 구조를 고정할 수 있다.

### 사용자 방향

사용자 방향이 비어 있으면 추천 기준으로 진행한다.

### 결과

완료. `news/news/{topic}` collection은 주제 필터로 탐색하고, 공지/업데이트는 기존 서비스 필터를 유지한다. news detail은 category별 필수 섹션을 렌더링하며 audit가 updates 관련 support 링크와 업계 뉴스 관련 blog 링크를 함께 검사한다.
