# 공개 콘텐츠 구조화 데이터 보강

작성일: 2026-06-17
상위 계획: `docs/product/backlog/2026-06-17-public-content-network-500-step-plan.md` 12차 292~295
범위: Article/BreadcrumbList/FAQPage/HowTo JSON-LD helper와 article detail 렌더링
제외: 외부 SEO API 조회, Search Console 상태 조회, 신규 원고 작성

## 1차: JSON-LD source of truth 분리

논의 필요: 구조화 데이터를 UI 컴포넌트 안에 둘지 helper로 분리할지.
선택지: UI 내부 유지, helper 분리, schema 라이브러리 도입.
추천: 현재 registry block 구조에서 파생하는 순수 helper로 분리한다. 별도 라이브러리는 YAGNI다.
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

1. article JSON-LD 생성 로직을 순수 helper로 분리한다.
2. 모든 article detail에 Article/NewsArticle/BlogPosting JSON-LD를 유지한다.
3. 모든 article detail에 BreadcrumbList JSON-LD를 추가한다.
4. support FAQ 글은 checklist/paragraph 근거가 있을 때 FAQPage JSON-LD를 추가한다.
5. support 단계형 글은 steps block이 있을 때 HowTo JSON-LD를 추가한다.
6. 본문에 없는 내용을 구조화 데이터에 만들지 않는다.

## 2차: 검증

논의 필요: FAQPage/HowTo를 모든 support 글에 강제로 넣을지 조건부로 넣을지.
선택지: 전체 강제, category/block 조건부, 수동 flag.
추천: category와 block 조건부로 넣는다. FAQPage는 FAQ category, HowTo는 steps block이 있을 때만 만든다.
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

1. FAQ category support 글에 FAQPage가 생성되는지 테스트한다.
2. steps block이 있는 support 글에 HowTo가 생성되는지 테스트한다.
3. news/blog 글에는 FAQPage/HowTo가 붙지 않는지 테스트한다.
4. article page가 JSON-LD graph를 렌더링하는지 테스트한다.

## 검증 예정

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-structured-data.test.ts`
- `pnpm --filter @yeon/web public-content:audit`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`
