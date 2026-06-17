# 공개 콘텐츠 Playwright smoke 보강

작성일: 2026-06-17  
상위 계획: `docs/product/backlog/2026-06-17-public-content-network-500-step-plan.md` 17차  
범위: `support.yeon.world`, `news.yeon.world`, `blog.yeon.world` 공개 콘텐츠 e2e smoke  
제외: 상담 워크스페이스, admin 편집/삭제/발행 기능, Search Console 실제 제출

## 1차: 공개 URL과 SEO smoke 보강

논의 필요: Playwright smoke를 전체 발행 글까지 넓힐지.  
선택지: 핵심 홈만, 홈과 대표 글, sitemap 기반 대표 URL.  
추천: 기존 홈/대표 글 smoke를 유지하고 sitemap 기반 대표 URL 200 확인과 metadata 구조 검증을 추가한다.  
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

1. 기존 `apps/web/e2e/public-content-smoke.spec.ts`를 확장한다.
2. 세 host의 sitemap에서 대표 홈/컬렉션/글 URL이 200으로 응답하는지 검증한다.
3. sitemap XML에 draft/admin/auth/API URL이 섞이지 않는지 검증한다.
4. host rewrite 응답 HTML의 canonical host가 실제 host와 일치하는지 검증한다.
5. metadata title과 description이 비어 있지 않은지 검증한다.
6. JSON-LD script가 parse 가능하고 기대 type/name을 가진다는 점을 유지한다.
7. 공개 사용자 HTML에 admin toolbar 또는 admin 전용 링크가 없는지 검증한다.
8. 공개 URL이 로그인으로 redirect되지 않는지 기존 검증을 유지한다.

## 2차: viewport와 문서 구조 smoke

논의 필요: 접근성 전체 audit를 이번 차수에 포함할지.  
선택지: smoke만, axe 전체 audit 포함, 별도 접근성 차수.  
추천: 이번에는 viewport overflow와 H1 구조만 smoke로 추가하고, axe 전체 audit는 별도 차수에서 다룬다.  
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

1. 모바일 viewport에서 대표 홈과 대표 글의 horizontal overflow가 없는지 확인한다.
2. 데스크톱 viewport에서 대표 글 본문 폭이 과도하지 않은지 확인한다.
3. 각 대표 페이지에 H1이 정확히 하나인지 확인한다.
4. heading level이 H1에서 시작하는지 확인한다.

## 검증 예정

- `pnpm --filter @yeon/web exec playwright test e2e/public-content-smoke.spec.ts --project=chromium`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`
