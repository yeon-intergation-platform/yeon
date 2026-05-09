# 4-작업-codex*1354-0000_ga-analytics-wide*[작업중]

- 시작 시각: 2026-05-09 13:54 KST
- 브랜치: `codex/ga-wide-instrumentation-20260509`
- 목표: `apps/web` 전역 GA 로더 + page_view + landing/auth/typing/card 핵심 이벤트를 현재 구현 기준으로 최대한 넓게 계측
- 제약: canonical 배포에서만 로드, 기존 unrelated generated 변경 미포함, 웹 build 검증 필수
- 진행 메모:
  - 기존 전역 layout에는 GA 로더가 없음
  - typing/card 페이지는 JSON-LD만 있고 공통 analytics 유틸은 현재 경로 기준 부재
  - landing/login/typing/card 주요 CTA와 생성/시작 지점을 중심으로 계측 예정

- 종료 시각: 2026-05-09 14:04 KST
- 검증: `pnpm --filter @yeon/web lint`, `pnpm --filter @yeon/web typecheck`, `pnpm --filter @yeon/web build`, `git diff --check`
- 비고: 기존 `apps/web/src/features/typing-service/characters/registry.generated.ts` 변경은 이번 작업 소유가 아니므로 stage/commit에서 제외
