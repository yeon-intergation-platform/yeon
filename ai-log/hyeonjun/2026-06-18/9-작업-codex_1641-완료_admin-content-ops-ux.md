# 9-작업-codex_1641-완료\_admin-content-ops-ux

## 목표

- `/admin` 공개 콘텐츠 경고를 줄이고 운영자가 상태를 더 쉽게 이해하게 한다.
- `/admin/typing-characters`를 admin 흐름에서 직접 접근 가능하게 한다.
- 타자 덱 관리자 화면의 생성/선택 흐름을 정리한다.

## 계획

1. 공개 콘텐츠 seed/DB의 meta/source 추적값을 보강한다.
2. 공통 admin shell/navigation을 추가한다.
3. `/admin`, `/admin/content`, `/admin/typing-decks`, `/admin/typing-characters`를 새 흐름에 맞춘다.
4. 관련 lint/typecheck/test와 Playwright 확인을 수행한다.

## 진행 기록

- 16:41 현재 `/admin/page.tsx`는 `/admin/members` redirect만 수행함을 확인했다.
- 공개 콘텐츠 seed 33건 모두 `metaDescription`과 `sourcePaths`가 비어 있음을 확인했다.
- 공개 콘텐츠 seed/JDBC record/DB migration을 보강해 admin SEO/source 경고 원인을 줄였다.
- `/admin` 운영 허브와 공통 admin navigation을 추가했다.
- `/admin/typing-characters`를 공통 admin navigation에서 직접 접근할 수 있게 했다.
- 타자 덱 admin 화면은 중복 서비스 헤더를 숨기고 새 덱 생성 폼을 접은 상태로 시작하게 했다.

## 검증

- `cd apps/backend && ./gradlew test --tests 'world.yeon.backend.public_content.*'`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm verify:parity`
- `pnpm --filter @yeon/web public-content:audit`
- `pnpm --filter @yeon/web build`
- Playwright: `http://localhost:3004/admin`, `/admin/content`, `/admin/typing-decks`, `/admin/typing-characters` 비로그인 guard 200 확인
