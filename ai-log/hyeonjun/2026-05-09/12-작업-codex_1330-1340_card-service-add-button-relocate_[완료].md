# 카드 상세 페이지 `+ 카드 추가` 위치 변경

## 목표
- `/card-service/decks/[deckId]`에서 `+ 카드 추가` 버튼을 상단 영역으로 이동한다.

## 변경 파일
- `apps/web/src/features/card-service/deck-detail-screen.tsx`

## 작업 내용
- `카드 목록` 헤더에서 분리해 화면 상단의 헤더 앞쪽으로 `+ 카드 추가` 버튼을 이동.
- 동일 버튼은 빈 상태 CTA에서도 공통 핸들러를 재사용하도록 리팩터링.
- 기존 `+ 카드 추가` 트리거에서 중복된 상태/트래킹 로직을 제거하고 `openCardEditor` 공통 호출로 정리.

## 검증
- `pnpm --filter @yeon/web exec eslint src/features/card-service/deck-detail-screen.tsx`
