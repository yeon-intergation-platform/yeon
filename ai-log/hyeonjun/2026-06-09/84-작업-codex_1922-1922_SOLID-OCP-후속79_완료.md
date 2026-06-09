# 84. SOLID OCP 후속 79

## 대상

- 300개 SOLID/예외 원칙 적용 백로그 항목 271-275
- `apps/backend/src/main/java/world/yeon/backend/root_auth/service/AuthSessionService.java`

## 변경

- 세션 provider 존재 판정을 `AuthProviderSet`으로 분리했다.
- 소셜 인증 요청 구성/지원 provider 판정을 `SocialAuthRequestParts`와 `SocialProviderPolicy`로 분리했다.
- dev-login 옵션 노출 조건을 `DevLoginOptionPolicy`로 분리했다.
- 관리자 역할 판정과 identity 재사용 충돌 판정을 각각 `AuthRolePolicy`, `IdentityReusePolicy`로 분리했다.

## 검증

- `cd apps/backend && ./gradlew compileJava`
- `cd apps/backend && ./gradlew test --tests world.yeon.backend.config.SecurityConfigTests`
- `git diff --check`
