# news/blog 도메인 정책과 news 홈 우선순위

상위 계획: `docs/product/backlog/2026-06-17-public-content-network-500-step-plan.md` 9차 201~210, 205~207 후속
범위: `news.yeon.world` 홈 위계, `blog.yeon.world` 독립 운영 정책 보강

## 1차

### 작업내용

1. `news.yeon.world` 홈은 `notice`, `updates`, `news` 순서로 보여준다.
2. 최신 featured 영역은 하나만 두고, 업계 뉴스보다 공지/업데이트를 우선한다.
3. news 글 카드와 detail 상단에 category별 보조 맥락을 표시한다.
4. `blog.yeon.world`를 `news.yeon.world/blog`가 아닌 독립 채널로 운영하는 정책을 더 구체화한다.
5. 테스트와 audit로 news 홈 순서, featured 개수, category별 보조 맥락을 검증한다.

### 논의 필요

- news 홈을 서비스별 묶음으로 유지할지, 공지/업데이트/해설 묶음으로 전환할지.
- blog를 news 하위 경로로 둘지 독립 subdomain으로 둘지.

### 선택지

- A. news 홈은 채널 category 우선으로 전환하고, blog는 독립 subdomain 정책을 유지한다.
- B. news 홈도 기존처럼 서비스별 묶음으로 둔다.
- C. news와 blog를 하나의 content hub로 다시 합친다.

### 추천

A를 추천한다. 사용자가 확정한 구조는 `news=공식 소식`, `blog=개발기/기술글`, `support=문제 해결`이므로, news 홈의 첫 위계도 서비스보다 공지/업데이트/해설 구분이 먼저 보여야 한다.

### 사용자 방향

사용자는 `news.yeon.world`, `blog.yeon.world`, `support.yeon.world`를 분리하고, blog를 독립 subdomain으로 운영하는 방향을 승인했다.

### 진행 결과

완료. `news.yeon.world` 홈은 공지/업데이트/업계 해설 순서로 표시하고, featured 영역은 공지/업데이트에서 하나만 고른다. news detail에는 공지 적용 서비스/적용일, 업데이트 변경 요약/사용자 영향도, 업계 해설의 YEON 관련성을 상단에 표시한다. `blog.yeon.world` 독립 운영 기준은 SEO 정책 문서에 보강했다.
