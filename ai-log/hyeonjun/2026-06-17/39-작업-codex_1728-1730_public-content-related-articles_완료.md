# 공개 콘텐츠 related articles 공용화

## 목표

- 500단계 계획의 공용 related articles 컴포넌트 항목을 진행한다.
- 관련 글 선택 로직과 렌더링을 article detail 내부에서 분리한다.
- 홈, collection, related section이 같은 article card view를 사용하게 한다.

## 범위

- `apps/web/src/features/public-content`
- 공개 콘텐츠 related articles 백로그

## 제외

- 추천 알고리즘 고도화
- Search Console/GA4 설정 변경
- 새 콘텐츠 작성

## 변경

- article card view를 별도 컴포넌트로 분리했다.
- 관련 글 선택 로직을 helper로 분리하고 최신순/limit 기준을 테스트로 고정했다.
- 관련 글 section을 공용 view 컴포넌트로 분리했다.
- article detail은 공용 helper와 view만 조립하게 정리했다.

## 검증

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-related-articles.test.ts` 통과
- `pnpm --filter @yeon/web public-content:audit` 통과: 36개 글
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과: 213 static pages
- `git diff --check` 통과
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only` 통과
