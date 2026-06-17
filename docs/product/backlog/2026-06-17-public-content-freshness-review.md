# 공개 콘텐츠 최신성 확인일

작성일: 2026-06-17
상위 계획: `docs/product/backlog/2026-06-17-public-content-network-500-step-plan.md` 20차 484~488
범위: support 문서 최근 확인일, freshness helper, governance report 최신성 evidence
제외: Spring DB schema 확장, admin 편집/발행 UI, Search Console/GA4 API 조회

## 1차: 최신성 source of truth

논의 필요: 최근 확인일을 별도 필드로 둘지, updatedAt을 임시 기준으로 쓸지.
선택지: `reviewedAt` 필드, `updatedAt` fallback, DB CMS 후속 처리.
추천: 정적 registry에는 `reviewedAt` optional을 열어두고, 값이 없으면 `updatedAt`을 최근 확인일로 사용한다.
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

1. `PublicContentArticle`에 optional `reviewedAt`을 추가한다.
2. 최근 확인일 helper를 만든다.
3. support 문서만 최신성 점검 대상으로 둔다.
4. 180일을 넘은 support 문서를 stale로 본다.

## 2차: 공개 UI와 운영 리포트 반영

논의 필요: 최근 확인일을 모든 글에 표시할지 support 글에만 표시할지.
선택지: support만, 전체 글, admin에서만.
추천: 사용법/문제 해결 신뢰가 중요한 support 글 detail에만 표시한다.
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

1. support article detail 상단 메타에 `최근 확인` 날짜를 표시한다.
2. governance report의 오래된 글 최신성 점검을 자동 ready/warning 항목으로 바꾼다.
3. stale support 글 수를 evidence로 출력한다.

## 3차: 검증

논의 필요: 날짜 기반 검증을 현재 날짜로 할지 고정 기준일로 할지.
선택지: 현재 날짜, 고정 기준일, 둘 다.
추천: unit test는 고정 기준일을 쓰고 CLI는 실행 시각을 사용한다.
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

1. freshness helper unit test를 추가한다.
2. governance report test에서 최신성 항목이 ready인지 확인한다.
3. public-content audit와 build가 기존 글 33개에서 깨지지 않는지 확인한다.

## 검증 예정

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-freshness.test.ts src/features/public-content/public-content-governance-report.test.ts`
- `pnpm --filter @yeon/web public-content:governance-report`
- `pnpm --filter @yeon/web public-content:audit`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`
