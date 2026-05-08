# 3-작업-codex_1644-1648_card-service-root-guest-entry_[완료]

- 시작: 2026-05-06 16:44 KST
- 종료: 2026-05-06 16:48 KST
- 작업자: codex
- 범위: `apps/web/src/lib/platform-services.ts`, `docs/product/backlog/seo.md`
- 목표: 루트 `yeon.world`에서 카드서비스를 비로그인 상태로도 바로 열 수 있게 만든다.
- 결과:
  - 카드서비스 접근 정책을 `authRequired`에서 `mixed`로 수정했다.
  - 루트 랜딩에서 카드서비스 카드가 비로그인 상태에도 링크로 렌더링되게 맞췄다.
- 검증:
  - `pnpm --filter @yeon/web build` 통과
- 메모: 카드서비스 내부 게스트 저장 흐름은 유지하고, 빌드 중 생성된 `registry.generated.ts` 변경은 원복했다.
