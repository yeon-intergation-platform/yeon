# 87. SOLID OCP 후속 82

## 대상

- 300개 SOLID/예외 원칙 적용 백로그 항목 279
- `apps/backend/src/main/java/world/yeon/backend/typing_decks/service/TypingDeckService.java`

## 변경

- 타자 덱 수정 가능 source 판정을 `TypingDeckEditSourcePolicy`로 분리했다.

## 검증

- 완료: `cd apps/backend && ./gradlew test --tests world.yeon.backend.typing_decks.service.TypingDeckServiceTests`
- 완료: `git diff --check`
