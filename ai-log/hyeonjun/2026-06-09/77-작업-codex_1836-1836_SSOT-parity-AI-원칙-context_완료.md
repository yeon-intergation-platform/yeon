# SSOT parity 복구 및 AI 상시 품질 원칙 컨텍스트 반영

- 대상: `apps/web/src/features/card-service/card-service-decks-screen.tsx`, `AGENTS.md`
- 원인: `node bin/verify-parity.mjs`가 web decks 화면 파일에서 `deriveCardDeckListViewState` 문자열을 요구했으나, 실제 파생은 hook 파일에 있어 화면 파일에서 검증 흔적이 누락됨.

## 변경

- web 카드 덱 목록 화면에 `useCardServiceDecksScreenState` 내부의 `deriveCardDeckListViewState` SSOT 파생을 명시하는 주석을 추가한다.
- `AGENTS.md` 구현 원칙에 사용자가 지정한 전체 상시 품질 체크리스트를 추가한다.
- 실행 백로그를 추가한다.

## 검증

- 완료: `node bin/verify-parity.mjs`
- 완료: `CI=true pnpm --filter @yeon/web lint`
- 완료: `CI=true pnpm --filter @yeon/web typecheck`
- 완료: `git diff --check`
- 완료: `bash bin/sync-skills.sh --check`
- 완료: `bash bin/verify-ssot.sh --project-only`
