# 1-작업-codex_1627-1630_analytics-ga4-추가_[완료]

- 시작: 2026-05-06 16:27 KST
- 종료: 2026-05-06 16:30 KST
- 작업자: codex
- 범위: `apps/web/src/app/layout.tsx`, `docs/product/backlog/seo.md`
- 목표: 웹 공통 레이아웃에 GA4 측정 태그를 추가해 기본 유입 계측을 시작한다.
- 결과:
  - `next/script` 기반 GA4 스니펫을 공통 레이아웃에 추가했다.
  - canonical 운영 도메인에서만 태그가 로드되도록 가드했다.
  - SEO backlog에 이번 차수 계획을 기록했다.
- 검증:
  - `pnpm --filter @yeon/web build` 통과
- 메모: 기존 작업 트리에 다른 변경이 많아 제 소유 파일만 수정했다.
