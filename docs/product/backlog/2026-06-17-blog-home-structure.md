# blog 홈 최신 글과 분류 대표 구조

상위 계획: `docs/product/backlog/2026-06-17-public-content-network-500-step-plan.md` 10차 226~232
범위: `blog.yeon.world` 홈 정보 구조, 최신 글, 분류별 대표 글

## 1차

### 작업내용

1. blog 홈은 `engineering`, `product`, `devlog`, `essay` 분류를 분명히 보여준다.
2. 각 분류의 작성 목적을 홈에서 짧게 드러낸다.
3. 최신 글 목록을 먼저 보여준다.
4. 분류별 대표 글을 보여준다.
5. blog 홈은 기존 generic service section 대신 blog 전용 구조를 사용한다.

### 논의 필요

- blog 홈을 서비스별 섹션으로 유지할지, 분류 중심으로 재구성할지.
- latest와 category representative를 별도 수동 큐로 둘지, 발행 글에서 파생할지.

### 선택지

- A. 발행 글 registry에서 최신 글과 분류 대표 글을 파생한다.
- B. blog 홈 전용 curated list를 별도 상수로 둔다.
- C. 기존 service section을 유지한다.

### 추천

A를 추천한다. blog는 서비스보다 글의 성격이 중요하므로 category 중심이 맞고, 별도 큐를 두면 발행 글과 홈 노출이 어긋날 수 있다.

### 사용자 방향

사용자 방향이 비어 있으면 추천 기준으로 진행한다.

### 결과

- `blog.yeon.world` 홈을 최신 글 우선 영역과 분류별 대표 글 영역으로 재구성했다.
- 최신 글과 분류별 대표 글은 blog article registry에서 파생해 별도 큐와 발행 글이 어긋나지 않게 했다.
- 분류 목적은 `engineering`, `product`, `devlog`, `essay` 4개 정책 분류에 고정했다.
- 기존 generic service section은 blog 홈에서 제외했다.

### 검증

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-blog-home.test.ts src/features/public-content/public-content-data.test.ts src/features/public-content/public-content-navigation.test.ts`
- `pnpm --filter @yeon/web public-content:audit`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`
- Playwright `/blog` desktop/mobile: 200, 필수 문구 누락 없음, 가로 overflow 없음
