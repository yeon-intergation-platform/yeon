# RSC/SSR 초기 HTML·로딩 경계 개선 백로그 작성

## 목표

Next.js는 유지하되 SPA식 client fetch 화면을 줄이고, RSC/SSR 초기 HTML·loading/Suspense 경계를 개선하는 실행 백로그를 문서화한다.

## 진행

- 코드 리뷰에서 확인한 상담 워크스페이스, 학생관리 layout, 커뮤니티 글 상세, 타자/카드 덱, 홈 랜딩, 전역 presence 비용을 차수별 백로그로 정리한다.

## 결과

- `docs/product/backlog/rsc-ssr-loading-boundary-20260512.md`를 추가했다.
- RSC/SSR 초기 HTML, `loading.tsx`, `Suspense`, client island 분리 기준을 8차 백로그로 정리했다.

## 검증

- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
