# 작업 로그: 공개 콘텐츠 본문 블록 렌더링 보강

시작: 2026-06-17 17:44  
종료: 2026-06-17 17:47  
작업자: codex  
브랜치: `feat/public-content-block-rendering-20260617`

## 목표

`docs/product/backlog/2026-06-17-public-content-network-500-step-plan.md`의 168~170번을 진행한다. 이미지 렌더링은 width/height 안정성을 확보하고, code block과 support 단계 목록의 본문 스타일을 보강한다.

## 변경

- public content block renderer를 별도 feature component로 분리했다.
- image block 타입을 추가하고 width/height 기반 aspect ratio helper를 추가했다.
- code block 타입과 차분한 코드 렌더링 스타일을 추가했다.
- support 문서 단계 목록이 번호와 본문을 분명하게 구분하도록 보강했다.
- 공개 콘텐츠 audit에서 image/code block 필수값을 검증하게 했다.
- Search Console/sitemap engineering 글에 실제 code block 예시를 추가했다.

## 검증

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-block-view.test.ts src/features/public-content/public-content-structured-data.test.ts src/features/public-content/public-content-table-of-contents.test.ts`
- `pnpm --filter @yeon/web public-content:audit`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`
