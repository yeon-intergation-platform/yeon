# 카드 이미지 assets Spring 전환 작업 로그

- 시작: 2026-05-12 19:10 KST
- 브랜치: `codex/next-backend-role-route-inventory-20260512`
- 목표: `apps/web/src/app/api/v1/card-decks/assets` 2개 route의 `@/server/services/card-deck-image-storage` 직접 의존 제거
- 범위: Spring card deck asset upload/download 추가, Next route는 Spring bridge만 유지
- 검증 예정:
  - `grep -R "@/server/services/" apps/web/src/app/api/v1 --include='route.ts' | grep -v "ServiceError"`
  - `pnpm --filter @yeon/web typecheck`
  - `cd apps/backend && ./gradlew test --tests '*CardDeckAsset*'`
  - `git diff --check`

## 진행 결과

- Spring 카드 이미지 asset controller/service/storage 추가 완료.
- Next `card-decks/assets` route 2개는 Spring bridge로 전환 완료.
- `apps/web/src/app/api/v1/card-decks/assets/**/route.ts`의 `@/server/services/` import 0개 확인.
- 잔여 `api/v1` backend-role route: 9개(counseling 7, integrations/local 2).

## 검증

- `cd apps/backend && ./gradlew test --tests '*CardDeckAsset*'` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web build` 통과.
- `git diff --check` 통과.
- `bash bin/sync-skills.sh --check` 통과.
- `bash bin/verify-ssot.sh --project-only` 통과(exit 0, 프로젝트 SSOT 점검은 스크립트가 git 저장소 아님으로 표시하며 건너뜀).
