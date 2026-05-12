# 카드 홈 문구 타자방식 정리

## 상태

- 완료

## 요청

- 카드 홈 상단을 `바로 시작하는 카드공부` 문구와 새 설명으로 변경한다.
- `Card Room` 라벨을 제거한다.
- `내 카드방 프로필`을 `내 프로필`로 변경한다.
- 프로필 보조 설명 문단을 제거한다.

## 변경

- `apps/web/src/features/card-service/card-service-home.tsx`
  - 상단 라벨 제거
  - 제목/설명 문구 교체
  - 프로필 섹션 제목 축약 및 설명 제거
- `docs/product/backlog/card-room-v1-ui-skeleton-20260512.md`
  - 2차 백로그 추가

## 검증

- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- 원본 작업트리에서 `bash bin/verify-ssot.sh --project-only`
