# SOLID/ISP-LSP 후속 21

## 목표

- 300개 SOLID/예외 백로그 항목 141~150을 완료한다.
- UI 큰 props 타입과 backend native query 타입 분기를 역할별 경계로 정리한다.

## 변경

- `YeonBottomSheetModalProps`를 visibility/content/style 타입 조합으로 분리했다.
- web/native `YeonEditableCardRowProps`를 content/state/action label/action/style 타입 조합으로 분리했다.
- `MergeGuestCardDeckRepository`의 native query 반환 row를 `NativeQueryRow`로 감싸 insertDeck의 직접 Object[] 분기를 제거했다.
- `CardDeckRouteRepository`의 native query row/scalar/date/number 변환을 `NativeQueryRow`와 `NativeQueryValue`로 모아 호출부의 instanceof 분기를 줄였다.
- row 길이/빈 값 오류 메시지에 필요한 컬럼 수, 실제 컬럼 수, 컬럼 위치를 포함했다.
- 백로그 항목 141~150을 완료 처리했다.

## 검증

- `CI=true pnpm --filter @yeon/ui typecheck`
- `cd apps/backend && ./gradlew test --tests '*CardDeck*'`
- `git diff --check`
- 백로그 300개 유지 및 항목 141~150 완료, UI/backend ISP-LSP 경계 검증 스크립트
