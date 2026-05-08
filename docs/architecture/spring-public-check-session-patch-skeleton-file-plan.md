# spring public-check session patch skeleton file plan

## backend
- `apps/backend/src/main/java/world/yeon/backend/public_check_sessions/controller/PublicCheckSessionController.java`
- `apps/backend/src/main/java/world/yeon/backend/public_check_sessions/dto/PublicCheckSessionSummaryResponse.java`
- `apps/backend/src/main/java/world/yeon/backend/public_check_sessions/dto/UpdatePublicCheckSessionRequest.java`
- `apps/backend/src/main/java/world/yeon/backend/public_check_sessions/dto/UpdatePublicCheckSessionResponse.java`
- `apps/backend/src/main/java/world/yeon/backend/public_check_sessions/repository/PublicCheckSessionRepository.java`
- `apps/backend/src/main/java/world/yeon/backend/public_check_sessions/service/PublicCheckSessionService.java`
- `apps/backend/src/main/java/world/yeon/backend/public_check_sessions/service/PublicCheckSessionServiceException.java`

## backend tests
- `apps/backend/src/test/java/world/yeon/backend/public_check_sessions/controller/PublicCheckSessionControllerTests.java`
- `apps/backend/src/test/java/world/yeon/backend/public_check_sessions/repository/PublicCheckSessionRepositoryTests.java`
- `apps/backend/src/test/java/world/yeon/backend/public_check_sessions/service/PublicCheckSessionServiceTests.java`

## web
- `apps/web/src/server/public-check-sessions-spring-client.ts`
- `apps/web/src/app/api/v1/spaces/[spaceId]/public-check-sessions/[sessionId]/route.ts`
- `apps/web/src/app/api/v1/spaces/[spaceId]/public-check-sessions/[sessionId]/__tests__/route.test.ts`
