# Support 실제 안내와 오류 신고 진입 개선

## 목표

- NEXA 설치 가이드에 실제 설치 페이지와 직접 초대 링크를 넣는다.
- 데스크톱 앱 설치와 디스코드 봇 추가를 분리해 설명한다.
- 불필요한 로그인 방법 글을 제거하고 로그인 풀림/오류 신고 글을 실사용 기준으로 고친다.
- support 홈에서 오류 신고 버튼을 바로 찾을 수 있게 한다.

## 변경

- `public-content-data.ts`에 NEXA 설치 URL, Discord 초대 URL, 오류 신고 mailto 상수를 추가했다.
- NEXA 봇 추가 글을 실제 링크와 Discord 승인 흐름 기준으로 다시 작성했다.
- `account/guides/login-with-yeon-account` 글을 런타임 목록에서 제외했다.
- 로그인 풀림 글과 오류 신고 글을 사용자 상황 중심 문구로 수정했다.
- support 홈에 오류 신고 CTA를 추가했다.

## 검증

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-data.test.ts src/features/public-content/public-content-support-home.test.ts src/features/public-content/public-content-structured-data.test.ts`
- `pnpm --filter @yeon/web public-content:import:dry-run`
- `pnpm --filter @yeon/web public-content:audit`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `git diff --check`
- Playwright: `http://localhost:3002/support` 오류 신고 CTA 표시 확인
- Playwright: `http://localhost:3002/support/nexa/guides/add-nexa-discord-bot` 설치/초대 링크와 데스크톱 앱 분리 문구 확인
