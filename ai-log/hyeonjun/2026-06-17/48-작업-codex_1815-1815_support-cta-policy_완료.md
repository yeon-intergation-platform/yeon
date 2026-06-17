# 작업 로그: support 하단 CTA 정책

## 목표

`docs/product/backlog/2026-06-17-public-content-network-500-step-plan.md`의 194번부터 198번을 진행한다. support 문서의 CTA는 본문 중간이 아니라 하단에만 두고, 서비스별 다음 행동으로 연결한다.

## 범위

- 공개 콘텐츠 support article CTA 데이터
- support CTA 정책 상수
- 공개 콘텐츠 품질 audit
- 단위 테스트

## 제외

- news/blog CTA 정책 변경
- 관리자 편집 기능
- 상담 워크스페이스 콘텐츠

## 변경

- support 서비스별 CTA 목표값을 `PUBLIC_CONTENT_SUPPORT_CTA_TARGETS`로 고정했다.
- NEXA support 글의 하단 CTA를 NEXA 설치 페이지로 통일했다.
- typing/card/community support 글의 CTA를 각 서비스 host로 통일했다.
- audit와 단위 테스트가 support CTA 정책을 검증하게 했다.

## 검증

- support article CTA 목록 확인: NEXA는 `https://discord-ai.yeon.world/install`, typing/card/community는 각 서비스 host로 통일
- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-data.test.ts` 통과: 4 tests
- `pnpm --filter @yeon/web public-content:audit` 통과: 36개 공개 콘텐츠 글 검사
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과: 213 static pages
- `git diff --check` 통과
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only` 통과
- Playwright 대표 support 글 4개 desktop/mobile 확인
  - NEXA/typing/card/community CTA 텍스트와 href 확인
  - CTA가 article body 뒤에 위치함
  - desktop/mobile horizontal overflow 없음
