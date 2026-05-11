# 작업 로그: typing-service 루트 섹션 인덱싱 허용

## 작업내용
- `apps/web/src/app/typing-service/rooms/page.tsx`의 `metadata.robots`를 `index: true, follow: true`로 변경
- `apps/web/src/app/typing-service/decks/page.tsx`의 `metadata.robots`를 `index: true, follow: true`로 변경

## 논의 필요
- 없음

## 선택지
- 전체 typing-service 하위 페이지 일괄 인덱싱
- 요청 URL만 선별 인덱싱

## 추천
- 요청한 2개 URL(`/typing-service/rooms`, `/typing-service/decks`)만 선별 인덱싱

## 사용자 방향
- `/typing-service/rooms`와 `/typing-service/decks` 검색 노출 허용

## 검증
- `pnpm --filter @yeon/web build` 통과

## 사용자 영향
- 두 페이지는 검색 노출 대상에 포함되어, 색인 생성 요청 시 처리 대상이 됨
