# card-room-home-cta-simplification

- 시작: 2026-05-12 22:15 KST
- 목표: `docs/product/backlog/card-room-home-cta-simplification-20260512.md` 계획을 실제 `/card-service` 홈에 반영한다.

## 구현 계획

- `Card Room`/프로필 보조문구/`내 카드방 프로필` 잔존 여부 확인
- `오늘의 시작` CTA를 `카드방 입장` + 덱 상태 기반 보조 CTA 2개로 고정
- 덱 상태는 기존 `useDeckList`를 source of truth로 사용
- 로딩 중에는 보조 CTA를 disabled 상태로 표시하고, 덱이 없으면 `새 덱 만들기`, 덱이 있으면 `내 덱 보기`를 표시

## 구현 결과

- `apps/web/src/features/card-service/card-service-home.tsx`의 정적 CTA 배열을 제거했다.
- `useDeckList`를 홈에서 사용해 덱 상태 기반 보조 CTA를 구성했다.
- `오늘의 시작`은 `카드방 입장` + `내 덱 보기` 또는 `새 덱 만들기` 총 2개만 표시한다.
- 덱 조회 중에는 disabled `덱 확인 중` CTA를 표시한다.

## 검증

- PASS `rg -n "Card Room|내 카드방 프로필|타자방과 같은 캐릭터 선택|선택한 캐릭터는 카드방" apps/web/src/features/card-service apps/web/src/app/card-service`
- PASS `pnpm --filter @yeon/web exec eslint src/features/card-service/card-service-home.tsx`
- PASS `pnpm --filter @yeon/web typecheck` (부패한 `.next/dev/types` 생성물을 제거 후 재실행)
- PASS `pnpm --filter @yeon/web lint`
- PASS `pnpm --filter @yeon/web build`
- PASS `git diff --check`
- PASS `bash bin/sync-skills.sh --check`
- PASS `bash bin/verify-ssot.sh --project-only`
