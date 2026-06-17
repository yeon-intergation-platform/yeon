# 공개 콘텐츠 운영 확인 모드

- 시작: 19:09
- 작업 워크트리: `yeon-3`
- 브랜치: `feat/public-content-ops-toolbar-20260617`
- 목표: 공개 콘텐츠 500단계 11차 251~275를 구현한다.
- 범위: `?ops=1` 기반 관리자 전용 toolbar, SEO/sitemap/preview 링크, 수정·저장·삭제 UI 미구현 정책.
- 검증 예정: ops toolbar 모델/route 테스트, public-content audit, web typecheck/lint/build, Playwright 공개/관리자 모드 확인.
- 종료: 19:23

## 결과

- 공개 article detail에 `?ops=1` 운영 확인 모드를 추가했다.
- 기본 공개 페이지는 관리자 세션을 확인하지 않고 SSG 상태를 유지한다.
- 운영 확인 데이터는 `/api/v1/public-content/ops-toolbar`에서 관리자 세션이 있을 때만 반환한다.
- 비관리자는 API `204`를 받으므로 toolbar를 볼 수 없다.
- 운영 확인 요청은 `X-Robots-Tag: noindex, nofollow`와 client robots meta를 사용한다.
- toolbar action은 preview, Search Console URL 검사, sitemap 확인만 둔다.
- 수정, 저장, 발행, archive, delete, autosave UI/API action은 추가하지 않았다.

## 검증

- 통과: `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-ops-toolbar.test.ts src/app/api/v1/public-content/ops-toolbar/__tests__/route.test.ts src/features/public-content/public-content-blog-detail.test.ts src/features/public-content/public-content-table-of-contents.test.ts`
- 통과: `pnpm --filter @yeon/web public-content:audit`
- 통과: `pnpm --filter @yeon/web typecheck`
- 통과: `pnpm --filter @yeon/web lint`
- 통과: `pnpm --filter @yeon/web build`
- 통과: Playwright production check
  - public: `200`, article text present, toolbar `0`, robots header 없음, ops robots meta `0`
  - `?ops=1`: `200`, article text present, toolbar `0` for no-admin, `X-Robots-Tag: noindex, nofollow`, ops robots meta `noindex,nofollow`, overflow 없음
  - no-admin API: `204`, `X-Robots-Tag: noindex, nofollow`
