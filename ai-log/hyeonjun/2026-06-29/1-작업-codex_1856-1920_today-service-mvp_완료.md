# Today 서비스 MVP 작업 로그

## 목표

- `todo.yeon.world`에서 사용할 수 있는 Today 서비스 MVP를 만든다.
- 기존 Yeon subdomain 라우팅, 홈 서비스 목록, SEO, Cloudflare Zero Trust public hostname 컨벤션을 따른다.

## 범위

- `apps/web` 신규 `/todo-service` 화면
- `apps/web/src/lib/subdomain-routing.ts`의 `todo.yeon.world` rewrite/redirect
- `apps/web/src/lib/platform-services.ts`, `apps/web/src/lib/seo.ts` 서비스 등록
- `docs/deployment/domain-routing.md` 운영 라우팅 문서 갱신
- Cloudflare Zero Trust Published application route 추가

## 설계 판단

- 1차는 localStorage 기반 개인용 웹 MVP로 진행한다.
- Spring API/DB/Flyway는 이번 차수에서 제외한다.
- 모바일 앱은 이번 차수에서 제외하되, 서버 계약을 만들지 않으므로 web/mobile API drift는 발생하지 않는다.

## 검증 계획

- `pnpm --filter @yeon/web test -- src/lib/__tests__/subdomain-routing.test.ts src/lib/__tests__/seo.test.ts src/lib/__tests__/platform-services.test.ts`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `git diff --check`
- Playwright로 로컬 `/todo-service` 화면 smoke
- 배포 후 `https://todo.yeon.world` HTTP/HTML 확인

## 완료 조건

- 코드와 문서가 PR main merge를 거쳐 운영에 반영된다.
- Cloudflare `todo.yeon.world` public hostname이 기존 `yeon-prod-web:3000` 컨벤션으로 추가된다.
- 최종 보고에 변경 파일, 검증 결과, 남은 리스크를 남긴다.

## 진행 기록

- Cloudflare DNS route: `todo.yeon.world` -> `yeon-tunnel` 추가 완료.
- Cloudflare Published application route: `todo.yeon.world` -> `http://yeon-prod-web:3000` 추가 완료.
- 배포 전 확인: `https://todo.yeon.world`가 Cloudflare tunnel을 거쳐 Next.js production web origin까지 도달한다.
- PR CI에서 SSOT job이 `googleapis` 미설치 환경의 top-level import로 실패해, Search Console dry-run은 의존성 없이 실행되고 실제 제출 경로에서만 `googleapis`를 동적 import하도록 보정했다.

## 검증 결과

- `pnpm --filter @yeon/web exec vitest run src/features/todo-service/todo-service-model.test.ts src/lib/__tests__/subdomain-routing.test.ts src/lib/__tests__/seo.test.ts src/lib/__tests__/platform-services.test.ts src/__tests__/proxy-subdomain-routing.test.ts` 통과: 5 files, 34 tests.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web build` 통과.
- `git diff --check` 통과.
- `bash bin/verify-ssot.sh --project-only` 통과.
- `node bin/verify-search-console-targets.mjs` 통과.
- Playwright local smoke 통과: `/todo-service` 진입, 할 일 추가, 진행중 지정, 완료 처리, empty/mobile 화면 확인.

## 스크린샷

- `ai-log/hyeonjun/2026-06-29/today-service-screenshots/desktop-after.png`
- `ai-log/hyeonjun/2026-06-29/today-service-screenshots/desktop-empty.png`
- `ai-log/hyeonjun/2026-06-29/today-service-screenshots/mobile.png`
