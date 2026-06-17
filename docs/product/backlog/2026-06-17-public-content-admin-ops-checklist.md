# 공개 콘텐츠 admin 운영 체크리스트

작성일: 2026-06-17  
상위 계획: `docs/product/backlog/2026-06-17-public-content-network-500-step-plan.md` 18차, 20차  
범위: `/admin/content` 읽기 전용 운영 현황  
제외: Search Console 실제 등록/제출 실행, Google credential 저장, admin 생성/수정/삭제/발행 기능

## 1차: admin 운영 체크리스트 모델

논의 필요: Search Console 등록 여부를 admin에서 자동 판정할지.  
선택지: 자동 API 조회, 수동 링크만 제공, credential 준비 후 후속 자동화.  
추천: credential이 없는 현재 단계에서는 수동 링크와 로컬에서 검증 가능한 sitemap/robots/SEO 상태를 먼저 표시한다.  
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

1. dashboard data에 운영 체크리스트 배열을 추가한다.
2. domain Search Console 확인 링크를 체크리스트에 포함한다.
3. support/news/blog URL-prefix Search Console 확인 링크를 체크리스트에 포함한다.
4. sitemap home/article 포함 상태를 자동 판정한다.
5. robots 링크가 채널별로 제공되는지 표시한다.
6. GA4 측정 ID와 report 링크를 표시한다.
7. SEO 경고 수가 0인지 표시한다.
8. 체크리스트 status를 `ready`, `warning`, `manual`로 나눈다.

## 2차: admin 화면 연결

논의 필요: 체크리스트를 전체 dashboard에만 둘지, 채널 화면에도 둘지.  
선택지: 전체 dashboard만, 채널 화면 포함, 별도 ops 페이지.  
추천: 초기에는 전체 `/admin/content` dashboard에 먼저 두고, 채널 화면은 기존 sitemap/robots/Search Console 버튼을 유지한다.  
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

1. `/admin/content`에 운영 체크리스트 섹션을 추가한다.
2. 각 항목에 사람이 다음 행동을 알 수 있는 짧은 note를 붙인다.
3. 링크가 있는 항목은 바로 열 수 있게 한다.
4. create/update/delete/publish 버튼은 추가하지 않는다.

## 3차: 문서 연결

논의 필요: 운영 체크리스트를 Search Console 문서에 명시할지.  
선택지: 문서 미수정, Search Console 가이드 연결, 별도 운영 런북.  
추천: 기존 `docs/seo/google-search-console.md`의 운영 체크리스트에 admin checklist 기준을 연결한다.  
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

1. Search Console 운영 가이드에 admin 체크리스트 확인 순서를 추가한다.
2. 자동 Google API 연동은 credential 준비 후 별도 작업임을 유지한다.

## 검증 예정

- `pnpm --filter @yeon/web test -- src/features/public-content/public-content-admin-model.test.ts`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`
