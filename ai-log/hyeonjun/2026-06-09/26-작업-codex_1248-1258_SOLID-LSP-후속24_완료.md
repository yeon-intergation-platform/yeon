# SOLID/LSP 후속 24차 — 모바일 카드 오류 메시지 어댑터 공용화

## 목표

- 300개 감사 항목 중 175~178을 처리한다.
- 모바일 카드 상세 화면에 반복된 `error instanceof Error` 분기를 화면 밖 공용 어댑터로 이동한다.

## 변경

- `apps/mobile/src/features/card-service/error-message.ts` 추가
  - `getCardServiceCauseMessage`와 `getCardServiceErrorMessage`를 제공한다.
  - unknown error 판별은 이 파일 한 곳에서 수행한다.
- `card-deck-detail-screen.tsx`
  - 생성/일괄추가/일괄덮어쓰기/수정/삭제/상세조회 오류 메시지를 공용 어댑터로 통일했다.
- 추가 정리
  - 카드 목록, 온보딩, 세션 context, 세션 해석, 마크다운 이미지 첨부, 학습 화면, 카드방 생성/입장/연결 오류 메시지도 같은 어댑터를 사용한다.
- 백로그 항목 175~178을 완료로 표시하고 24차 적용 완료 섹션을 추가했다.

## 검증

- `CI=true pnpm --filter @yeon/mobile typecheck`

## 결과

- 모바일 카드 서비스 화면 컴포넌트가 구체 오류 타입 판별에 직접 의존하지 않는다.
- 비-Error 오류도 fallback + 원인 메시지로 일관되게 표시된다.
