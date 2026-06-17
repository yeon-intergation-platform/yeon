# 공개 콘텐츠 운영 거버넌스 리포트

작성일: 2026-06-17  
상위 계획: `docs/product/backlog/2026-06-17-public-content-network-500-step-plan.md` 20차 476~491, 498  
범위: 출시 후 주간/월간 점검 리포트, 자동 evidence, 수동 Search Console/GA4 확인 항목  
제외: Search Console API 자동 조회, GA4 API 자동 조회, admin 편집/발행 UI

## 1차: 운영 리포트 모델

논의 필요: 주간/월간 점검을 문서에만 둘지 실행 가능한 리포트로 둘지.  
선택지: 문서만, 스크립트 리포트, admin UI 리포트.  
추천: 먼저 스크립트 리포트로 만들고 admin UI는 후속으로 필요할 때 붙인다.  
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

1. 공개 콘텐츠 dashboard data에서 channel/article/SEO/source/sitemap evidence를 가져온다.
2. 출시 첫 주 점검 항목을 리포트에 포함한다.
3. 월간 점검 항목을 리포트에 포함한다.
4. 신규 기능/배포/기술 결정 시 content candidate를 만들라는 on-change 항목을 포함한다.
5. Search Console과 GA4는 credential이 없으므로 manual 상태로 둔다.
6. repo에서 확인 가능한 sitemap/title/source/SEO 상태는 ready/warning으로 계산한다.

## 2차: CLI와 문서 연결

논의 필요: 출력 형식을 Markdown으로 할지 JSON으로 할지.  
선택지: Markdown, JSON, 둘 다.  
추천: 운영자가 바로 읽기 쉬운 Markdown을 기본으로 하고, 자동화가 필요하면 후속 JSON을 추가한다.  
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

1. `public-content:governance-report` script를 추가한다.
2. 리포트 출력에 수동 확인 항목과 자동 evidence를 분리한다.
3. `docs/seo/public-content-quality-checklist.md`에 실행 명령을 추가한다.
4. `docs/seo/google-search-console.md`에 주간 snapshot 전 리포트 실행을 연결한다.

## 3차: 검증

논의 필요: 리포트 출력을 snapshot test로 고정할지 핵심 행만 검증할지.  
선택지: 전체 snapshot, 핵심 행 검증, 수동 확인.  
추천: 숫자/문구 drift에 덜 취약하게 핵심 행과 status만 검증한다.  
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

1. 리포트 builder unit test를 작성한다.
2. CLI가 현재 registry에서 정상 실행되는지 확인한다.
3. 기존 `public-content:audit`와 충돌하지 않는지 확인한다.

## 검증 예정

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-governance-report.test.ts`
- `pnpm --filter @yeon/web public-content:governance-report`
- `pnpm --filter @yeon/web public-content:audit`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`
