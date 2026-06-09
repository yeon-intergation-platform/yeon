# 85. SOLID OCP 후속 80

## 대상

- 300개 SOLID/예외 원칙 적용 백로그 항목 276-277
- `apps/backend/src/main/java/world/yeon/backend/root_auth/social/SocialIdentityProviderClient.java`

## 변경

- provider별 profile fetch 분기를 `SocialProviderRegistry`로 분리했다.
- provider HTTP status 성공/실패 판정을 `SocialProviderHttpStatus`로 분리했다.

## 검증

- `cd apps/backend && ./gradlew compileJava`
- `cd apps/backend && ./gradlew test --tests world.yeon.backend.config.SecurityConfigTests`
- `git diff --check`
