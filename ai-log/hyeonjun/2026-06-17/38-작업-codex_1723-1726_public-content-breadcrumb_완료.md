# 공개 콘텐츠 breadcrumb 공용화

## 목표

- 500단계 계획의 공용 breadcrumb 컴포넌트 항목을 진행한다.
- article과 collection 화면 breadcrumb를 같은 builder로 맞춘다.
- structured data breadcrumb도 같은 경로 builder를 재사용한다.

## 범위

- `apps/web/src/features/public-content`
- 공개 콘텐츠 breadcrumb 백로그

## 제외

- routing 구조 변경
- Search Console/GA4 설정 변경
- 새 콘텐츠 작성

## 변경

- article/collection 공용 breadcrumb builder를 추가했다.
- breadcrumb 렌더 컴포넌트를 별도 view 파일로 분리했다.
- article `BreadcrumbList` structured data가 공용 builder를 재사용하게 했다.
- article과 collection 화면 breadcrumb를 같은 경로 순서로 렌더링하게 했다.

## 검증

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-breadcrumb.test.ts src/features/public-content/public-content-structured-data.test.ts` 통과
- `pnpm --filter @yeon/web public-content:audit` 통과: 36개 글
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과: 213 static pages
- `git diff --check` 통과
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only` 통과
