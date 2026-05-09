# 5-작업-codex*1412-1415_auth-reset-request-suspense-build-fix*[완료]

- 시작 시각: 14:12
- 종료 시각: 14:15
- 배경: GA 전역 page_view 계측 머지 이후 Docker/CI `pnpm --filter @yeon/web build`에서 `/auth/reset-request` prerender가 `useSearchParams() should be wrapped in a suspense boundary`로 실패했다.
- 원인: `apps/web/src/components/analytics/google-analytics-page-tracker.tsx`가 `useSearchParams()`를 사용하지만, 루트 레이아웃에서 Suspense 없이 렌더되고 있었다.
- 조치:
  1. `apps/web/src/app/layout.tsx`에서 `GoogleAnalyticsPageTracker`를 `Suspense fallback={null}` 경계 안으로 감쌌다.
  2. `docs/product/backlog/seo.md`에 차수 7 회귀 수정 계획을 기록했다.
- 검증:
  - `git diff --check`
  - `pnpm --filter @yeon/web lint`
  - `pnpm --filter @yeon/web typecheck`
  - `pnpm --filter @yeon/web build`
- 결과: `/auth/reset-request`가 다시 정적 prerender 대상으로 정상 생성되며 웹 빌드가 통과했다.
- 주의사항: `apps/web/src/features/typing-service/characters/registry.generated.ts` 기존 변경은 이번 수정 커밋에 포함하지 않는다.
