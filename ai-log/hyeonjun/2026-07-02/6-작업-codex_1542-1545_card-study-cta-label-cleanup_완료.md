# 카드 학습 CTA 명칭 정리 작업 로그

## 목표

- `card-service` 덱 상세에서 Study Desk 제거 상태를 확인한다.
- 기본 학습 CTA 문구를 `학습하기`로 변경한다.

## 범위

- `apps/web/src/features/card-service/components/deck-detail-header.tsx`
- `docs/product/backlog/2026-07-02-card-study-cta-label-cleanup.md`
- `ai-log/hyeonjun/2026-07-02/card-study-cta-label-screenshots/`

## 검증 계획

- `rg "study-desk|25분 집중 작업대|일반학습|일반 학습" apps/web/src packages/ui/src`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `git diff --check`
- Playwright 덱 상세 스크린샷 확인

## 진행 상태

- 완료

## 변경 내용

- 최신 main 기준 `apps/web/src`와 `packages/ui/src`에서 `study-desk`, `25분 집중 작업대`, `일반학습`, `일반 학습` 잔여 코드가 없음을 확인했다.
- 덱 상세 기본 학습 CTA 문구를 `학습하기`로 변경했다.
- 카드방의 별도 `학습 시작` 문구는 요청한 덱 상세 범위가 아니어서 유지했다.

## 검증 결과

- `rg "study-desk|25분 집중 작업대|집중 작업대|일반학습|일반 학습" apps/web/src packages/ui/src` 결과 없음
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- Playwright 덱 상세 before/after 스크린샷 검증 통과
  - `before-deck-detail-desktop.png`
  - `after-deck-detail-desktop.png`
  - `before-deck-detail-mobile.png`
  - `after-deck-detail-mobile.png`

## 참고

- Playwright 검증 중 백엔드 8081 미기동으로 community/typing 보조 API 503/500 로그가 있었지만, 카드 덱 상세 렌더와 CTA assertion은 통과했다.
