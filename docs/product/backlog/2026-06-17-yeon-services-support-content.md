# Yeon 서비스 support 초기 콘텐츠

상위 계획: `docs/product/backlog/2026-06-17-public-content-network-500-step-plan.md` 14차 326~350
범위: typing, card, community, account 공용 support 글

## 1차

### 작업내용

1. typing support 글에 시작, 방 입장, 레이스 문제, 결과 저장, 접속 문제를 작성한다.
2. card support 글에 덱 생성, 카드 추가/수정, 학습 시작, 데이터 표시, 접속 문제를 작성한다.
3. community support 글에 글 작성, 댓글, 글 표시 문제, 접속 문제, 이용 정책을 작성한다.
4. account support 글에 로그인, 로그인 유지 문제, 개인정보 처리, 공개 URL, 오류 신고를 작성한다.
5. typing 글에는 race-server 연결 점검을 포함한다.
6. card 글에는 게스트와 로그인 사용자 차이를 포함한다.
7. community 글에는 공개성과 사용자 행동 기준을 포함한다.

### 논의 필요

- 세 서비스 글 수를 정확히 균등하게 맞출지, 검색 가능성이 큰 항목부터 먼저 늘릴지.
- account 글을 support 최상위에 둘지, 각 서비스별 FAQ에 분산할지.

### 선택지

- A. 각 서비스 5개와 account 5개를 정적 support 글로 추가한다.
- B. typing/card/community만 추가하고 account는 다음 차수로 넘긴다.
- C. 검색량이 큰 typing 글만 먼저 확장한다.

### 추천

A를 추천한다. 14차 항목이 서비스별 최소 콘텐츠와 공용 계정/정책 글을 함께 요구하므로, 같은 차수에서 collection과 sitemap을 모두 채우는 편이 운영 기준이 분명하다.

### 사용자 방향

사용자 방향이 비어 있으면 추천 기준으로 진행한다.

### 결과

1. typing, card, community, account support 글 16개를 추가했다.
2. 기존 typing/card/community/account 글에 race-server, 게스트/로그인, 공개 피드, YEON 전체 개인정보 기준을 보강했다.
3. 공개 콘텐츠 500단계 계획의 326~350 항목을 완료로 표시했다.

### 검증

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-data.test.ts src/features/public-content/public-content-structured-data.test.ts src/features/public-content/public-content-support-action-summary.test.ts src/features/public-content/public-content-related-articles.test.ts`
- `pnpm --filter @yeon/web public-content:audit`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`
