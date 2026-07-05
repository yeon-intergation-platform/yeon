# 작업 로그: 다국어화 점수 검증과 관리자 회원관리

## 목표

- 독립 평가 토큰/에이전트로 다국어화 점수를 확인하고 95점 미만 항목을 보완한다.
- 관리자 회원관리 화면에서 검색, 필터, 권한 변경, 세션 무효화, 삭제 등 운영 기능을 제공한다.
- 사용자가 직접 회원탈퇴할 수 있는 기능을 추가한다.

## 현재 파악

- 이전 글로벌화 PR은 `main`에 머지되었다.
- 기존 `/admin/members`는 회원 목록 읽기 전용이다.
- 기존 Spring `users` 계층은 목록과 생성만 지원한다.
- `/admin/users`는 경험치/카드덱 중심 보조 화면이다.

## 진행

- 작업 브랜치: `feat/admin-user-management-i18n-audit-20260704`
- 1차 독립 `verifier` 평가: 86/100, FAIL.
- 2차 독립 `verifier` 평가: 92/100, FAIL.
- 3차 독립 `verifier` 평가: 95/100, PASS.
- 1차 평가 보완:
  - root metadata/OG locale을 플랫폼 언어 기반으로 전환.
  - 게임 상세 좋아요/찜/댓글/SWF 로딩 오버레이를 `ko/en` 문구로 분리.
  - 프로필 경험치/수정/회원탈퇴 화면의 영어 fallback과 날짜 locale을 정리.
  - 공통 헤더 언어 변경 시 typing 설정 locale도 동기화.
  - `/admin/members` 회원관리 UI, 거부/오류 상태, admin shell nav를 `ko/en`으로 분리.
  - 서버에서 판단한 언어를 client header/admin list 초기 렌더까지 전달해 영어 첫 렌더가 한국어로 흔들리지 않게 수정.
- 관리자 회원관리:
  - Spring `users` API에 표시 이름 수정, role 변경, 세션 무효화, 관리자 삭제, 본인 회원탈퇴를 추가.
  - 사용자 목록 응답에 이메일 인증일, 활성 세션 수, 연결 provider, 카드/타자 덱 개수를 포함.
  - 웹 BFF `/api/v1/users/*` 경로를 Spring 호출로 연결.
  - 어드민 화면에서 검색, role 필터, 표시 이름 저장, role 변경, 세션 정리, 삭제를 지원.

## 검증

- `pnpm --filter @yeon/api-contract test -- users user-experience`
- `pnpm --dir apps/web exec vitest run src/app/api/v1/users/__tests__/route.test.ts src/features/game-service/__tests__/game-service-i18n.test.ts src/features/profile/__tests__/profile-i18n.test.ts src/lib/__tests__/platform-language.test.ts`
- `pnpm --dir apps/web exec vitest run src/features/game-service/__tests__/game-service-i18n.test.ts src/features/profile/__tests__/profile-i18n.test.ts src/lib/__tests__/platform-language.test.ts`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `pnpm --filter @yeon/ui typecheck`
- `pnpm --filter @yeon/ui lint`
- `pnpm --filter @yeon/api-contract typecheck`
- `pnpm --filter @yeon/api-client typecheck`
- `pnpm --filter @yeon/api-client lint`
- `pnpm --filter @yeon/mobile typecheck`
- `pnpm verify:parity`
- `cd apps/backend && ./gradlew test --tests '*users*'`
- `git diff --check`

## 결과

- 다국어화 독립 평가 기준 95/100으로 통과.
- 관리자 회원관리와 회원탈퇴 API/UI 구현 완료.
