# GA4 클릭 이벤트 집계 검증

## 목표

- 공개 콘텐츠/서비스 클릭 이벤트가 GA4로 의도한 이름과 매개변수로 전송되는지 확인한다.
- 필요한 경우 최소 코드 변경으로 누락된 추적을 보강한다.
- Playwright 또는 네트워크/브라우저 로그로 검증 증거를 남긴다.

## 진행

- 작업 워크트리: `/Users/osuma/coding_stuffs/yeon-3`
- 브랜치: `analytics/ga4-click-verification-20260618`
- `cheat pro` 기반 repo-harness MCP `harness_status` 호출 성공
- 공개 콘텐츠 CTA 클릭 이벤트 Playwright 회귀 테스트 보강
- 공개 콘텐츠 일반 링크 클릭 이벤트 Playwright 회귀 테스트 추가
- Playwright `baseURL`을 `PLAYWRIGHT_BASE_URL`로 오버라이드할 수 있게 설정 보강

## 검증

- `PLAYWRIGHT_BASE_URL=http://localhost:3001 pnpm --filter @yeon/web exec playwright test e2e/public-content-smoke.spec.ts --project=chromium --grep "GA4 event params"` 통과
- Playwright 직접 브라우저 검증으로 `public_content_cta_click`, `public_content_link_click` payload 확인
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
