# 22-작업-codex_0000-0010_service-root-external-link-update_[완료]

- 시작 시각: 2026-05-09 KST
- 종료 시각: 2026-05-09 KST
- 목표: 카드/타자/상담 서비스 내부에서 `https://yeon.world`(메인)로 즉시 이동할 수 있도록 홈 링크를 정규화

## 수행 내용
- `apps/web/src/lib/platform-services.ts`
  - `PLATFORM_HOME_HREF`를 `/`에서 `https://yeon.world`로 변경
- 카드 서비스
  - `apps/web/src/features/card-service/card-service-home.tsx`
  - `apps/web/src/features/card-service/deck-detail-screen.tsx`
  - `apps/web/src/features/card-service/deck-play-screen.tsx`
  - `apps/web/src/features/card-service/components/deck-detail-header.tsx`
  - 홈/YEON 링크 `href="/"` -> `href={PLATFORM_HOME_HREF}`
- 타자 서비스
  - `apps/web/src/features/typing-service/typing-service-header.tsx`
  - 홈 YEON 링크 `href="/"` -> `href={PLATFORM_HOME_HREF}`
- 상담 서비스
  - `apps/web/src/features/counseling-service-shell/counseling-top-nav.tsx`
  - YEON 링크 `href="/"` -> `href={PLATFORM_HOME_HREF}`

## 검증
- `pnpm --filter @yeon/web exec eslint src/lib/platform-services.ts src/features/card-service/card-service-home.tsx src/features/card-service/deck-detail-screen.tsx src/features/card-service/deck-play-screen.tsx src/features/card-service/components/deck-detail-header.tsx src/features/typing-service/typing-service-header.tsx src/features/counseling-service-shell/counseling-top-nav.tsx`
- `git diff --check`
- `pnpm --filter @yeon/web typecheck` (실패: 기존 `apps/web/src/features/typing-service/typing-room-screen.tsx`에 머지 마커 잔존으로 `TS1185` 발생)

## 비고
- 코드 변경은 상단 3개 서비스의 루트 이동 경로를 상대경로(`/`)에서 절대 경로(`https://yeon.world`)로 통일.
