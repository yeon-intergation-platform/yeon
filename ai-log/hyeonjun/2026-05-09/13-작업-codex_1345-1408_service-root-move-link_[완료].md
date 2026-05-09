# card-service/typing-service/상담기록서비스에서 메인 이동 경로 보강

## 목표
- 서비스 내부 화면에서 `https://yeon.world`(루트)로 바로 이동할 수 있는 진입점을 추가한다.

## 변경 파일
- `apps/web/src/features/card-service/card-service-home.tsx`
- `apps/web/src/features/card-service/deck-play-screen.tsx`
- `apps/web/src/features/card-service/components/deck-detail-header.tsx`
- `apps/web/src/features/typing-service/typing-service-header.tsx`
- `apps/web/src/features/counseling-service-shell/counseling-top-nav.tsx`

## 작업 내용
- `card-service`
  - 상단 브랜드 텍스트/로고 링크를 루트(`/`)로 이동하도록 변경.
  - 디테일/재생 화면 내에서도 데스크톱/모바일 액션에서 루트 진입 경로 유지.
- `typing-service`
  - 헤더에서 `YEON` 브랜드를 분리해 루트(`/`) 링크로 이동.
  - 기존 서비스 타이틀은 `/typing-service` 링크로 유지해 맥락 보존.
- `상담기록서비스`
  - 공통 상단 네비게이션에 `YEON` 링크(`/`)를 추가해 즉시 루트 복귀 가능하도록 수정.

## 검증
- `pnpm --filter @yeon/web exec eslint src/features/card-service/card-service-home.tsx src/features/card-service/deck-detail-screen.tsx src/features/card-service/deck-play-screen.tsx src/features/card-service/components/deck-detail-header.tsx src/features/typing-service/typing-service-header.tsx src/features/counseling-service-shell/counseling-top-nav.tsx`
- `pnpm --filter @yeon/web build` 실행 시 기존 브랜치의 공통 빌드 충돌/분기 잔여 이슈로 실패(이미 존재하던 Typing/Counseling 파일의 머지마커 및 analytics import 중복 이슈).
