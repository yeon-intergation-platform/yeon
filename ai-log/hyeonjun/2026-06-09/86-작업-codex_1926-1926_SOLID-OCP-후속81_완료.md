# 86. SOLID OCP 후속 81

## 대상

- 300개 SOLID/예외 원칙 적용 백로그 항목 278
- `apps/backend/src/main/java/world/yeon/backend/typing_character_frames/service/TypingCharacterFrameService.java`

## 변경

- 관리자 role 또는 seed email 허용 판정을 `TypingCharacterFrameAdminPolicy`로 분리했다.

## 검증

- `cd apps/backend && ./gradlew test --tests world.yeon.backend.typing_character_frames.controller.TypingCharacterFrameControllerTests`
- `git diff --check`
