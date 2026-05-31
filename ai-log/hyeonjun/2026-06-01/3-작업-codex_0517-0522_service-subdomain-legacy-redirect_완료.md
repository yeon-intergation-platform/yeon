# service subdomain legacy redirect 작업 로그

- 시작: 2026-06-01 05:17
- 종료: 2026-06-01 05:22
- 목표: yeon.world 홈 서비스 카드 링크를 subdomain으로 변경하고 legacy path URL을 canonical subdomain으로 redirect한다.
- 범위: typing-service, card-service, community
- 제외: counseling-workspace 신규 유지보수

## 변경

- 홈 서비스 카드 `href`를 서비스별 `publicHref`로 변경했다.
- 홈 JSON-LD 서비스 URL을 canonical subdomain 기준으로 변경했다.
- `yeon.world/{typing-service,card-service,community}`와 하위 경로를 서비스별 subdomain으로 308 redirect하도록 proxy 로직을 추가했다.
- 서비스 subdomain에서 legacy prefix가 붙은 URL도 prefix 없는 canonical URL로 308 redirect하도록 했다.
- domain routing 문서와 300 체크리스트의 기존 path 정책을 canonical redirect 기준으로 갱신했다.

## 검증

- `pnpm --filter @yeon/web test src/lib/__tests__/subdomain-routing.test.ts src/lib/__tests__/seo.test.ts src/lib/__tests__/platform-services.test.ts`: 16 tests passed
- `pnpm --filter @yeon/web lint`: passed
- `pnpm --filter @yeon/web typecheck`: passed
- `pnpm --filter @yeon/web build`: passed
- `git diff --check`: passed for owned files
- `bash bin/sync-skills.sh --check`: passed
- `bash bin/verify-ssot.sh --project-only`: passed
