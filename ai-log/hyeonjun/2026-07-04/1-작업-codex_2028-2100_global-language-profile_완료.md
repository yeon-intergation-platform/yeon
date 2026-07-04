# 글로벌 언어 설정과 프로필 화면 복구

## 목표

- 공통 언어 설정을 만들고 게임 서비스가 한국어/영어 선택을 제대로 반영하게 한다.
- `/profile`이 빈 화면처럼 보이지 않도록 인증/비인증/오류 상태를 명확히 렌더링한다.

## 작업 메모

- 대상: `apps/web/src/features/game-service`
- 대상: `apps/web/src/features/profile`
- 대상: `apps/web/src/components/product-shell`
- 대상: `apps/web/src/lib`
- 공통 언어 SSOT: `apps/web/src/lib/platform-language.ts`
- 서버 언어 해석: `apps/web/src/lib/platform-language-server.ts`
- 게임 서비스 i18n: `apps/web/src/features/game-service/game-service-i18n.ts`
- 프로필 i18n: `apps/web/src/features/profile/profile-i18n.ts`

## 검증

- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web exec vitest run src/lib/__tests__/platform-language.test.ts src/features/game-service/__tests__/game-service-i18n.test.ts src/features/game-service/__tests__/game-catalog.test.ts`
- Playwright:
  - `ai-log/hyeonjun/2026-07-04/global-language-game-en.png`
  - `ai-log/hyeonjun/2026-07-04/global-language-game-ko.png`
  - `ai-log/hyeonjun/2026-07-04/global-language-profile-en.png`
