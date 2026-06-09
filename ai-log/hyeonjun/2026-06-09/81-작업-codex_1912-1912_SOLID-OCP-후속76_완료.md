# 81. SOLID OCP 후속 76

## 대상

- 300개 SOLID/예외 원칙 적용 백로그 항목 256-258
- `apps/backend/src/main/java/world/yeon/backend/card_decks/assets/service/CardDeckAssetStorage.java`
- `apps/backend/src/main/java/world/yeon/backend/card_decks/assets/service/CardDeckAssetServiceException.java`

## 변경

- 업로드/다운로드 재시도 판단을 `StorageOperation` 정책으로 분리했다.
- 다운로드 404 변환을 `NotFoundPolicy.CARD_ASSET`로 분리했다.
- storage 예외 변환 시 원인 예외를 보존할 수 있도록 `CardDeckAssetServiceException` cause 생성자를 추가했다.

## 검증

- `cd apps/backend && ./gradlew test --tests world.yeon.backend.card_decks.assets.controller.CardDeckAssetControllerTests --tests world.yeon.backend.card_decks.assets.controller.CardDeckAssetUploadIntegrationTest`
- `git diff --check`
