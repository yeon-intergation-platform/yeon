# 도메인 skill 7종 작성

## 목적

ai 에이전트가 yeon 코드베이스에서 일관된 패턴으로 작업하도록 7개 skill 문서를 `.claude/commands/`에 추가. 각 skill의 when-to-use 트리거를 path glob/import 매칭으로 명시해 오발동 방지.

## 작성 파일

1. `tanstack-query-conventions.md` — `@tanstack/react-query` 임포트 시
2. `zod-contract-conventions.md` — `packages/api-contract/**` 변경 시
3. `route-state-contract.md` — `apps/web/src/app/**/page.tsx` 신규 또는 `useSearchParams` 첫 도입 시
4. `drizzle-migration-workflow.md` — `src/server/db/**` 또는 `migrations/` 변경 시
5. `race-server-conventions.md` — `apps/race-server/**` 변경 시
6. `guest-auth-branching.md` — `guestStore` 또는 `useIsAuthenticated` 신규 도입 시
7. `ai-call-wrapper.md` — OpenAI/Anthropic SDK 임포트 또는 STT/요약 로직 신규 작성 시

## 검증

- `bin/sync-skills.sh --check` 통과
- 각 skill의 Use_When/Do_Not_Use_When 명확

## 범위

- `.claude/commands/<n>.md` 7개 신규
- bin/sync-skills.sh 실행으로 `.codex/skills/SHARED/<n>/SKILL.md` 자동 wrapper 생성
