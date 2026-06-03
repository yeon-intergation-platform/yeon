# 로컬 서비스 진입 링크 운영 도메인 이탈 방지 작업 로그

- 시작: 2026-06-01
- 상태: 완료
- 목표: localhost 루트 포털에서 플래시카드/타자/커뮤니티 클릭 시 운영 subdomain으로 이동하지 않게 한다.
- 범위: apps/web platform services, landing home, tests, docs/product/backlog, ai-log
- 원칙: 운영 canonical URL과 로컬 디버깅 진입 URL을 분리한다.

## 변경

- 서비스 카드 진입 href를 요청 host 기준으로 resolve하는 helper를 추가했다.
- `yeon.world`/`www.yeon.world`에서는 기존 canonical subdomain을 유지한다.
- `localhost`, `127.0.0.1`, `dev.yeon.world` 등 비운영 root host에서는 내부 path(`/typing-service`, `/card-service`, `/community`)를 사용한다.
- 루트 페이지는 현재 요청 host로 치환된 서비스 목록을 랜딩 UI에 전달한다.
- 플랫폼 서비스 테스트에 운영/로컬 host별 URL resolve 검증을 추가했다.

## 검증

- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `cd apps/web && pnpm exec vitest run src/lib/__tests__/platform-services.test.ts` 통과
- `pnpm --filter @yeon/web test -- platform-services`는 pnpm argument forwarding 문제로 전체 web 테스트가 실행되어, 동결 대상 counseling 계열 기존 실패가 발생했다.
- `git diff --check` 통과
- Playwright: `http://localhost:3000/`에서 타자/카드/커뮤니티 링크가 각각 내부 path이고, 플래시카드 클릭 후 `http://localhost:3000/card-service`에 머무는 것 확인
