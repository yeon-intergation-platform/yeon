# NEXA support 초기 콘텐츠 보강

상위 계획: `docs/product/backlog/2026-06-17-public-content-network-500-step-plan.md` 13차 301~325
범위: NEXA 설치, 권한, provider, admin, 개인정보, 업데이트 확인 support 글

## 1차

### 작업내용

1. 기존 NEXA support 글이 301~310을 충족하는지 확인한다.
2. provider 대상 글 후보 311~313을 공개 support 글로 추가한다.
3. admin 대상 정책/안전장치 글 314를 공개 support 글로 추가한다.
4. `BOT_PERMISSIONS.md`의 permissions integer와 Message Content Intent 설명을 일반 관리자 문장으로 보강한다.
5. `Manage Webhooks` fallback 설명을 문제 해결 글에 반영한다.
6. 관련 FAQ/news/update 링크가 들어갈 수 있도록 NEXA 글의 links block을 보강한다.

### 논의 필요

- provider 대상 글을 실제 발행 글로 둘지, 아직 후보 상태의 내부 초안으로 둘지.
- admin 정책 글을 support policy로 둘지, news/update 공지로 둘지.

### 선택지

- A. 정적 공개 콘텐츠에 provider/admin support 글을 바로 추가한다.
- B. provider/admin 글은 백로그 후보로만 남긴다.
- C. provider/admin 글은 blog 또는 news로만 다룬다.

### 추천

A를 추천한다. 사용자가 실제로 검색할 문제는 설치와 운영 방법이며, support에 있어야 바로 해결 문서로 연결된다. 과장 없이 현재 문서 근거가 있는 범위만 작성한다.

### 사용자 방향

사용자 방향이 비어 있으면 추천 기준으로 진행한다.

### 결과

1. NEXA support에 provider/admin 운영 글 4개를 추가했다.
   - `nexa/guides/connect-ollama-provider`
   - `nexa/guides/install-provider-agent-safely`
   - `nexa/faq/provider-pool-how-it-works`
   - `nexa/policy/admin-safety-controls`
2. NEXA 권한 글에 permissions integer, Message Content Intent, Manage Webhooks fallback 설명을 보강했다.
3. NEXA 설치/권한/문제 해결 글에 관련 support/news 링크를 추가했다.
4. 공개 콘텐츠 500단계 계획의 301~325 항목을 완료로 표시했다.

### 검증

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-data.test.ts src/features/public-content/public-content-structured-data.test.ts src/features/public-content/public-content-support-action-summary.test.ts src/features/public-content/public-content-related-articles.test.ts`
- `pnpm --filter @yeon/web public-content:audit`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`
