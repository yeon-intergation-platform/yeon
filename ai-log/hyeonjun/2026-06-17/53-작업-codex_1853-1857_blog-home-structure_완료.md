# blog 홈 최신 글과 분류 대표 구조

- 시작: 18:53
- 작업 워크트리: `yeon-4`
- 브랜치: `feat/blog-home-structure-20260617`
- 목표: 공개 콘텐츠 500단계 10차 226~232를 구현한다.
- 범위: blog 홈 category 분리, 최신 글 우선, 분류별 대표 글.
- 검증 예정: blog home model 테스트, public-content audit, web typecheck/lint/build, Playwright blog 홈 확인.

## 결과

- blog 홈 전용 모델을 추가해 최신 글 4개와 분류별 대표 글을 발행 글 registry에서 파생했다.
- blog 홈에 최신 글 영역과 `engineering`, `product`, `devlog`, `essay` 대표 글 영역을 추가했다.
- 공개 콘텐츠 500단계 계획의 226~232번을 완료 표시했다.

## 검증

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-blog-home.test.ts src/features/public-content/public-content-data.test.ts src/features/public-content/public-content-navigation.test.ts`
- `pnpm --filter @yeon/web public-content:audit`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`
- Playwright `/blog` desktop/mobile: 200, 필수 문구 누락 없음, 가로 overflow 없음

## 완료

- 종료: 18:57
