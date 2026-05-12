# 로컬 import draft route Spring boundary 정리

- 시작: 2026-05-12 19:31 KST
- 브랜치: `codex/local-draft-route-spring-20260512`
- 목표: `integrations/local/drafts/[draftId]` route의 legacy service import 제거
- 범위: route-local Zod schema 추가, Spring client 호출 유지

## 진행 결과

- `integrations/local/drafts/[draftId]` route의 legacy `@/server/services/import-preview-service` import 제거.
- PATCH body 검증은 route-local Zod schema로 유지.
- 잔여 `api/v1` backend-role route는 8개로 감소.

## 검증

- `pnpm install --frozen-lockfile` 실행: main의 TipTap 신규 deps 설치(락파일 변경 없음).
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web build` 통과.
- `git diff --check` 통과.
- `bash bin/sync-skills.sh --check` 통과.
- `bash bin/verify-ssot.sh --project-only` 통과(exit 0, 프로젝트 SSOT 점검은 스크립트가 git 저장소 아님으로 표시하며 건너뜀).
